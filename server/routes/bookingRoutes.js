const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkInBooking,
  toggleCheckIn,
  getCertificate,
  resendBookingEmail,
} = require('../controllers/bookingController');
const authorize = require('../middleware/role');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('numberOfTickets').isInt({ min: 1 }).withMessage('At least 1 ticket is required'),
    body('couponCode').optional({ checkFalsy: true }).trim(),
    body('backupEmail').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid backup email address'),
    body('paymentProvider').optional().isIn(['demo', 'razorpay', 'stripe']).withMessage('Unsupported payment provider'),
  ],
  validate,
  createBooking
);

router.get('/', protect, getMyBookings);
router.post(
  '/check-in',
  protect,
  authorize('organizer', 'admin'),
  [body('ticketCode').notEmpty().withMessage('Ticket code is required')],
  validate,
  checkInBooking
);
router.post('/:id/toggle-check-in', protect, authorize('organizer', 'admin'), toggleCheckIn);
router.get('/:id/certificate', protect, getCertificate);
router.post('/:id/resend-email', protect, resendBookingEmail);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
