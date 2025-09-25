'use strict';

const axios = require('axios');
const Loan = require('../loan');

module.exports = async function () {

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
};