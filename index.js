const schedule = require('node-schedule');
const http = require('http');


// Create a server object
const server = http.createServer((req, res) => {
  // Set the response HTTP header with HTTP status and Content type
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Send the response body as 'Hello, World!'
  res.end('Hello, World!\n');
});


const PORT = 3000;
// Define the port to listen on const PORT = 3000;

// Start the server and listen on the specified port
server.listen(PORT, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const job = schedule.scheduleJob('* * * * *', function () {
    console.log('The answer to life, the universe, and everything!');
});

