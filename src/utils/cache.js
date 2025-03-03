// redisHelper.js
const Redis = require('ioredis');

class RedisHelper {
    constructor() {
        this.createConnection();
    }

    createConnection() {
        this.client = new Redis({
            host: 'localhost',
            port: 6379,
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
            }
        });

        this.client.on('connect', () => {
            console.log('Redis Connected Successfully');
        });

        this.client.on('error', (error) => {
            console.error('Redis Connection Error:', error);
            // Try to reconnect
            setTimeout(() => {
                this.createConnection();
            }, 5000);
        });

        this.client.on('close', () => {
            console.log('Redis Connection Closed. Attempting to reconnect...');
            this.createConnection();
        });
    }

    async get(key) {
        try {
            if (!this.client.status === 'ready') {
                await this.createConnection();
            }
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis Get Error:', error);
            return null;
        }
    }

    async set(key, value, expiry = null) {
        try {
            if (!this.client.status === 'ready') {
                await this.createConnection();
            }
            if (expiry) {
                await this.client.setex(key, expiry, JSON.stringify(value));
            } else {
                await this.client.set(key, JSON.stringify(value));
            }
            return true;
        } catch (error) {
            console.error('Redis Set Error:', error);
            return false;
        }
    }

    async delete(key) {
        try {
            if (!this.client.status === 'ready') {
                await this.createConnection();
            }
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Redis Delete Error:', error);
            return false;
        }
    }

    // Check connection status
    isConnected() {
        return this.client.status === 'ready';
    }

    // Graceful shutdown
    async quit() {
        if (this.client) {
            await this.client.quit();
        }
    }
}

// Create single instance
const redisHelper = new RedisHelper();

// Handle process termination
process.on('SIGINT', async () => {
    await redisHelper.quit();
    process.exit();
});

module.exports = redisHelper;