const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    tierName: { type: String, default: 'General' },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'converted', 'cancelled'],
      default: 'waiting',
    },
    notifiedAt: Date,
  },
  { timestamps: true }
);

waitlistSchema.index({ event: 1, user: 1, tierName: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
