const net = require('net');

const server = net.createServer({ allowHalfOpen: true }, (socket) => {
    console.log('Client connected');

    socket.on('data', (data) => {
        const request = data.toString();
        console.log('Received request:', request);

        // Parse the HTTP request
        const [requestLine, ...headers] = request.split('\r\n');
        const [method, path, httpVersion] = requestLine.split(' ');

        if (method === 'GET') {
            // Handle GET request
            const responseBody = 'Hello, world!';
            const response = [
                'HTTP/1.1 200 OK',
                'Content-Type: text/plain',
                `Content-Length: ${responseBody.length}`,
                '',
                responseBody
            ].join('\r\n');
            socket.write(response);
        } else {
            // Handle other HTTP methods
            const responseBody = 'Method Not Allowed';
            const response = [
                'HTTP/1.1 405 Method Not Allowed',
                'Content-Type: text/plain',
                `Content-Length: ${responseBody.length}`,
                '',
                responseBody
            ].join('\r\n');
            socket.write(response);
        }

        // Close the socket after sending the response
        // socket.end();
        // socket.setTimeout(0);
        // socket.pause();
    });

    socket.on('end', () => {
        console.log('Client disconnected');
        // socket.end();
    });

    socket.on('close', (hadError) => {
        console.log(`Connection closed ${hadError ? 'with error' : 'cleanly'}`);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(9090, () => {
    console.log('Server listening on port 9090');
});