'use strict';

const dotenv = require('dotenv');
dotenv.config();

const Slack = require('./src/slack');
const Store = require('./src/store');
const App = require('./src/app');

const app = new App(
    new Slack(process.env.SLACK_SIGNING_SECRET, process.env.SLACK_BOT_TOKEN, '#general'),
    new Store(process.env.REDIS_URL)
);
