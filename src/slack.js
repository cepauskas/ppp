'use strict';

class Slack {
    constructor(secret, token, channnel) {
        let Slack = require("@slack/bolt");
        this.slack = new Slack.App({
            signingSecret: process.env.SLACK_SIGNING_SECRET,
            token: process.env.SLACK_BOT_TOKEN,
        });
    }

    async send(message) {
        await this.slack.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: '#general',
            text: message
        });
    }
}

module.exports = Slack;