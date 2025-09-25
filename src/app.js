'use strict';

class App {
    constructor(slack, store) {

        this.app = require('express')();
        this.port = 3000;

        this.slack = slack;
        this.store = store;

        this.notify = this.notify.bind(this);
        this.cleanup = this.cleanup.bind(this);
        this.handle = this.handle.bind(this);

        this.slack.send('Starting...');

        this.app.get('/', this.handle);
        this.app.post('/', this.handle);

        this.app.listen(this.port, async () => {
            console.log(`Example app listening on port ${this.port}`)
        });

        process.on('SIGINT', this.cleanup);
        process.on('SIGTERM', this.cleanup);
    }

    async notify() {

        let notify = [];

        notify = notify.concat(await require('./provider/pk')());
        notify = notify.concat(await require('./provider/finomark')());
        notify = notify.concat(await require('./provider/debitum')());

        for (let i = 0; i < notify.length; i++) {
            let loan = notify[i];

            if (await this.store.get(loan.id)) {
                continue;
            }

            await this.store.set(loan.id, 'true');
            await this.slack.send(loan.toString());
        }

        return notify;
    }

    async handle(req, res) {
        let loans = await this.notify();
        res.send(loans);
    }

    async cleanup() {
        await this.store.close();
        await this.slack.send('Closing...');

        process.exit(0);
    };
}

module.exports = App;