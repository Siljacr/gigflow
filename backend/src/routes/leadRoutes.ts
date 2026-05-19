import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

const leadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('source')
    .notEmpty()
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Source must be Website, Instagram, or Referral'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status filter'),
  query('source')
    .optional()
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Invalid source filter'),
  query('sort').optional().isIn(['latest', 'oldest']).withMessage('Sort must be latest or oldest'),
];

router.get('/stats', getLeadStats);
router.get('/export', exportLeadsCSV);
router.get('/', validate(listQueryValidation), getLeads);
router.get('/:id', getLead);
router.post('/', validate(leadValidation), createLead);
router.put(
  '/:id',
  validate([
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('source').optional().isIn(['Website', 'Instagram', 'Referral']),
    body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']),
    body('notes').optional().trim().isLength({ max: 500 }),
  ]),
  updateLead
);
router.delete('/:id', deleteLead);

export default router;
