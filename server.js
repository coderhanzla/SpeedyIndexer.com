const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const submissionRoutes = require('./routes/submission');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000", methods: ["GET", "POST"] }
});



// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/speedyindexer');

// Socket.IO Auth Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = user;
        next();
    });
});

// Socket.IO Realtime Events
io.on('connection', (socket) => {
    console.log(`User ${socket.user.id} connected`);

    socket.on('join-queue', (queueId) => {
        socket.join(queueId);
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.user.id} disconnected`);
    });
});

// Realtime queue updates
const emitQueueUpdate = (queueId, data) => {
    io.to(queueId).emit('queue-update', data);
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/submit', submissionRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Speedy Indexer Server running on port ${PORT}`);
});

module.exports = { io, emitQueueUpdate };

