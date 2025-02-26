const express = require('express');
const app = express();
const port = 9090;

app.post('/established', (req, res) => {
  // Set the content type to text/plain.
  res.setHeader('Content-Type', 'text/plain');

  let counter = 1;
  const intervalId = setInterval(() => {
    // Write a string to the response.
    console.log(`Sending string ${counter}`);
    res.write(`String ${counter}\n`);
    
    // If we've sent 10 strings, clear the interval and end the response.
    if (counter === 10) {
      clearInterval(intervalId);
      res.end();
    }
    counter++;
  }, 1000); // Send a string every 200 milliseconds.
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});