'use strict';

const dotenv = require('dotenv');
dotenv.config();

const Slack = require('./src/slack');
const Store = require('./src/store');

let app = require('express')();
let port = 3000;

let slack = new Slack(process.env.SLACK_SIGNING_SECRET, process.env.SLACK_BOT_TOKEN, '#general');
let store = new Store(process.env.REDIS_URL);

let notify = async () => {

    let notify = [];

    notify = notify.concat(await require('./src/provider/pk')());
    notify = notify.concat(await require('./src/provider/finomark')());
    notify = notify.concat(await require('./src/provider/debitum')());

    for (let i = 0; i < notify.length; i++) {
        let loan = notify[i];

        if (await store.get(loan.id)) {
            continue;
        }

        await store.set(loan.id, 'true');
        await slack.send(loan.toString());
    }

    return notify;
}

let handle = async (req, res) => {
    let loans = await notify();
    res.send(loans);
}

let cleanup = async () => {
    await store.close();

    process.exit(0);
};

app.get('/', handle);
app.post('/', handle);

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
});

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
