const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must be created by a user']
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false // Soft delete field
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ isDeleted: 1 });
transactionSchema.index({ amount: 1 });

// Compound indexes for common queries
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });
transactionSchema.index({ createdBy: 1, date: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return this.type === 'income' ? `+$${this.amount.toFixed(2)}` : `-$${this.amount.toFixed(2)}`;
});

// Pre-find middleware to exclude soft-deleted records
transactionSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Pre-save middleware to validate date is not in future
transactionSchema.pre('save', function(next) {
  if (this.date > new Date()) {
    return next(new Error('Transaction date cannot be in the future'));
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
