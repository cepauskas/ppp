const dotenv = require('dotenv')
dotenv.config()

const express = require('express');
const app = express();
const port = 3000;

const cheerio = require('cheerio');
const axios = require('axios');

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
        value,
        margin,
        duration,
        link,
    ) {
        this.id = id;
        this.rating = rating;
        this.value = value;
        this.margin = margin;
        this.duration = duration;
        this.link = link;
    }

    toString() {
        return `${this.id} ${this.rating} ${this.value} ${this.margin} ${this.duration} ${this.link}`;
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
                `pk-${td.eq(0).text().trim().split("\n")[2].trim()}`,
                td.eq(0).text().trim().split("\n")[0].trim(),
                td.eq(3).text().trim(),
                td.eq(4).text().trim(),
                td.eq(5).text().trim(),
                'https://www.paskoluklubas.lt/paraiskos'
            )
        );
    });

    return loans;
}

const finomark = async function () {

    const $ = await cheerio.fromURL('https://www.finomark.lt/investavimas');
    const loans = [];

    $('.card-company').each((i, row) => {

        let td = $(row).find('table tr td');
        let href = td.find('a').attr('href');

        loans.push(
            new Loan(
                `fino-${href.split("/")[2].trim()}`,
                td.eq(0).text().trim(),
                $(row).find('.progress-label').text().split("/")[0].trim(),
                td.eq(1).find('span').eq(0).text().trim(),
                td.eq(1).find('span').eq(1).text().trim(),
                `https://www.finomark.lt${href}`
            )
        );
    });

    return loans;
}

const debitum = async function () {

    const loans = [];

    let response = await axios.post(
        'https://debitum.investments/gtw/loans/api/invoices/public/filter?page=0&size=100&sort=interestRate,desc',
        {
            isOpen: true,
            maxRiskRatingLetter: "A+",
            minRiskRatingLetter: "D",
            minInterestRate: 1,
            maxInterestRate: 100
        }
    );

    for (let i = 0; i < response.data.content.length; i++) {
        let data = response.data.content[i];
        loans.push(new Loan(
            `debitum-${data.id}`,
            data.rankLetter,
            data.loanAmount,
            `${data.interestRate} %`,
            `${data.remainingTermInDays} days`,
            'https://debitum.investments/en/invest'
        ));
    }

    return loans;
}


const notify = async function () {

    await redis.connect();

    let notify = [];

    notify = notify.concat(await pk());
    notify = notify.concat(await finomark());
    notify = notify.concat(await debitum());

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

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
});
