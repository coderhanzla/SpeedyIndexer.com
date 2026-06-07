module.exports = {
    apps: [{
        name: 'speedyindexer-api',
        script: './backend/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            MONGODB_URI: process.env.MONGODB_URI,
            REDIS_URL: process.env.REDIS_URL
        }
    }, {
        name: 'speedyindexer-worker',
        script: './backend/workers/indexingWorker.js',
        instances: 8,
        exec_mode: 'cluster'
    }]
};