const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    googleId: String,
    name: String,
    subscription: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    apiQuota: { type: Number, default: 100 },
    apiUsage: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);