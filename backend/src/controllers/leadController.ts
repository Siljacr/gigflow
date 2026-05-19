import { Response } from 'express';
import Lead from '../models/Lead';
import { AuthenticatedRequest, PaginationQuery, LeadStatus, LeadSource } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { convertLeadsToCSV } from '../utils/csv';

const DEFAULT_LIMIT = 10;

export const getLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = String(DEFAULT_LIMIT),
      status,
      source,
      search,
      sort = 'latest',
    } = req.query as PaginationQuery;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: Record<string, unknown> = {};

    // Role-based: sales users can only see their own leads
    if (req.user?.role === 'sales') {
      filter['createdBy'] = req.user.id;
    }

    if (status) filter['status'] = status;
    if (source) filter['source'] = source;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter['$or'] = [{ name: searchRegex }, { email: searchRegex }];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendSuccess(res, 'Leads retrieved successfully', leads, 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params['id']).populate('createdBy', 'name email').lean();

    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }

    // Role-based access
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, 'Access denied', 403);
      return;
    }

    sendSuccess(res, 'Lead retrieved', lead);
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const createLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, status, source, notes } = req.body as {
      name: string;
      email: string;
      status?: LeadStatus;
      source: LeadSource;
      notes?: string;
    };

    const lead = await Lead.create({
      name,
      email,
      status: status ?? 'New',
      source,
      notes,
      createdBy: req.user?.id,
    });

    sendSuccess(res, 'Lead created successfully', lead, 201);
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const updateLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params['id']);

    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }

    // Role-based: sales can only update their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, 'Access denied', 403);
      return;
    }

    const { name, email, status, source, notes } = req.body as Partial<{
      name: string;
      email: string;
      status: LeadStatus;
      source: LeadSource;
      notes: string;
    }>;

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (status !== undefined) lead.status = status;
    if (source !== undefined) lead.source = source;
    if (notes !== undefined) lead.notes = notes;

    await lead.save();

    sendSuccess(res, 'Lead updated successfully', lead);
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const deleteLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params['id']);

    if (!lead) {
      sendError(res, 'Lead not found', 404);
      return;
    }

    // Role-based: sales can only delete their own leads, admin can delete any
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, 'Access denied', 403);
      return;
    }

    await lead.deleteOne();

    sendSuccess(res, 'Lead deleted successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const exportLeadsCSV = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, source, search } = req.query as PaginationQuery;

    const filter: Record<string, unknown> = {};

    if (req.user?.role === 'sales') {
      filter['createdBy'] = req.user.id;
    }

    if (status) filter['status'] = status;
    if (source) filter['source'] = source;
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter['$or'] = [{ name: searchRegex }, { email: searchRegex }];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();
    const csv = convertLeadsToCSV(leads as never);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="gigflow-leads-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getLeadStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const matchStage: Record<string, unknown> = {};
    if (req.user?.role === 'sales') {
      matchStage['createdBy'] = req.user.id;
    }

    const [statusStats, sourceStats, totalLeads] = await Promise.all([
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.countDocuments(matchStage),
    ]);

    const stats = {
      total: totalLeads,
      byStatus: statusStats.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {} as Record<string, number>
      ),
      bySource: sourceStats.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {} as Record<string, number>
      ),
    };

    sendSuccess(res, 'Stats retrieved', stats);
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
