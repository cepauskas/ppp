'use string';

class Store {
    constructor(url) {
        this.connected = false;
        this.redis = require("redis").createClient({ url: url });
    }

    async get(key) {
        await this.connect();
        return await this.redis.get(key)
    }

    async set(key, value) {
        await this.connect();
        return await this.redis.set(key, value)
    }

    async connect() {
        if (this.connected) {
            return;
        }

        await this.redis.connect();
        this.connected = true;
    }

    async close() {
        if (!this.connected) {
            console.log('closed alread');
            return;
        }

        console.log('close');
        this.connected = false;

        return await this.redis.quit();
    }
}

module.exports = Store;