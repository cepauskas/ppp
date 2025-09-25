'use strict';

const cheerio = require('cheerio');
const Loan = require('../loan');

module.exports = async function () {

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
};