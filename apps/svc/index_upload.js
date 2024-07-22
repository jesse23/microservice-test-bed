const express = require('express');
const app = express();
const port = 9090;

// Mock for issue below
// https://github.com/chimurai/http-proxy-middleware/issues/483

// Middleware to parse the body as a stream for /ping3 route
const stream = require('stream');
const bodyParser = (req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        req.bodyStream = new stream.Readable();
        req.bodyStream.push(data);
        req.bodyStream.push(null);
        next();
    });
};

app.post('/reject_directly', (req, res) => {
    console.log('ping2 -> reject without consume the body')
    // Return 409 status code directly
    res.sendStatus(409);
});

app.post('/reject_after_read', bodyParser, (req, res) => {
    // Process the stream here if needed
    const content = req.bodyStream;
    // For now, we'll just return the status code
    res.sendStatus(409);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});