const http = require( 'http' );
const express = require('express');

const app = express();

app.get('/endless-get', (req, res) => {
    // Do not end the response to simulate a socket leak
    res.writeHead( 200, { 'Content-Type': 'text/plain' } );
    res.write( 'This response will never end...' );
    // console.log(res.a.b.c.d.e);
    // res.end();
});

const httpServer = http.createServer(app);
const _server = httpServer.listen(9090, () => {
    console.log('Proxy server is running on http://localhost:9090');
});
// _server.setTimeout(3000)

