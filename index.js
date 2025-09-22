const schedule = require('node-schedule');
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const job = schedule.scheduleJob('* * * * *', function () {
    console.log('The answer to life, the universe, and everything!');
});

