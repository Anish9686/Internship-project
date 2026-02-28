require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Redis Adapter for Scaling (Optional)
if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => console.log('Redis Client Error', err));
    subClient.on('error', (err) => console.log('Redis Client Error', err));

    Promise.all([pubClient.connect(), subClient.connect()])
        .then(() => {
            io.adapter(createAdapter(pubClient, subClient));
            console.log('Redis Adapter Connection Successful');
        })
        .catch((err) => {
            console.error('Redis connection failed. Skipping Redis adapter.', err.message);
            console.log('Tip: Start Redis or remove REDIS_URL from .env to avoid this error.');
        });
}

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/document'));

// Basic Route
app.get('/', (req, res) => {
    res.send('Collaborative Document Editor API is running...');
});

// Socket.io Manager
require('./sockets/socketManager')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
