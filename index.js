const dotenv = require('dotenv')
dotenv.config()

const express = require('express');
const app = express();
const port = 3000;

const cheerio = require('cheerio');

const Slack = require("@slack/bolt");

const redis = require("redis").createClient({ url: process.env.REDIS_URL });

const slack = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});

class Loan {
    constructor(
        id,
        rating,
        date,
        value,
        margin,
        duration,
        link,
    ) {
        this.id = id;
        this.rating = rating;
        this.date = date;
        this.value = value;
        this.margin = margin;
        this.duration = duration;
        this.link = link;
    }

    toString() {
        return `${this.id} ${this.rating} ${this.date} ${this.value} ${this.margin} ${this.duration} ${this.link}`;
    }
}

const pk = async function () {

    const $ = await cheerio.fromURL('https://www.paskoluklubas.lt/paraiskos');
    const loans = [];

    $('#front_loan_requests tr').each((i, row) => {

        if (i === 0) {
            return;
        }

        let td = $(row).find('td')
        loans.push(
            new Loan(
                td.eq(0).text().trim().split("\n")[2].trim(),
                td.eq(0).text().trim().split("\n")[0].trim(),
                td.eq(2).text().trim(),
                td.eq(3).text().trim(),
                td.eq(4).text().trim(),
                td.eq(5).text().trim(),
                'https://www.paskoluklubas.lt/paraiskos'
            )
        );
    });

    return loans;
}


const notify = async function () {

    await redis.connect();

    let notify = await pk();

    for (let i = 0; i < notify.length; i++) {
        let loan = notify[i];
        if (await redis.get(loan.id)) {
            continue;
        }

        await redis.set(loan.id, 'true');

        await slack.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: '#general',
            text: loan.toString()
        });
    }

    await redis.quit();

    return notify;
};

const handle = async (req, res) => {
    let loans = await notify();
    res.send(loans);
};

app.get('/', handle);
app.post('/', handle);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
