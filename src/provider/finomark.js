'use strict';

const cheerio = require('cheerio');
const Loan = require('../loan');

module.exports = async function () {

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
};