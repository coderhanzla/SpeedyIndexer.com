const mongoose = require('mongoose');

const urlJobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    urls: [{ url: String, status: { type: String, enum: ['pending', 'processing', 'success', 'failed'], default: 'pending' }, timestamp: { type: Date, default: Date.now } }],
    queueId: String,
    totalUrls: Number,
    processed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    success: { type: Number, default: 0 },
    status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' },
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
    apiUsage: {
        google: Number,
        indexnow: Number,
        ping: Number
    }
});

module.exports = mongoose.model('UrlJob', urlJobSchema);