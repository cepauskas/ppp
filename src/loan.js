'use strict';

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

module.exports = Loan;