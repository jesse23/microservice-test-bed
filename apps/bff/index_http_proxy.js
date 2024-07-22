const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer({
    // agent: false
});

app.use((req, res) => {
    /*
    req.headers['Expect'] = '100-Continue';
    req.headers['Connection'] = 'Close';
    */
   console.log('Received request:', req.url);
    proxy.web(req, res, {
        target: 'http://localhost:9090',
        changeOrigin: true
    }, (err) => {
        console.error('Error occurred:', err.message);
        res.status(500).send('Proxy error');
    });
});

// Handle the proxy error event
proxy.on('error', (err, req, res) => {
    console.error('Error occurred:', err.message);
    // res.status(500).send('Proxy error');
});

/*
proxy.before('web', 'stream', (req, res, options) => {
    if (req.headers.expect) {
        req.__expectHeader = req.headers.expect;
        delete req.headers.expect;
    }
});
*/

// Handle the proxy request event
proxy.on('proxyReq', (proxyReq, req, res, options) => {
    /*
  if (req.__expectHeader) {
    proxyReq.setHeader('Expect', req.__expectHeader);
    proxyReq.setHeader('Connection', 'Keep-Alive');
   }
    */
  // console.log(`Proxying request to ${req.url} with headers:`, proxyReq.getHeaders());
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`Received response from ${req.url} with status code:`, proxyRes.statusCode);
  res.status(200);
});

proxy.on('close', (req, socket, head) => {
  console.log('Client disconnected');
});

const httpServer = http.createServer(app);
const _server = httpServer.listen(3000, () => {
    console.log('Proxy server is running on http://localhost:3000');
});
_server.setTimeout(3000)

/*
app.listen(3000, () => {
    console.log('Proxy server is running on http://localhost:3000');
});
*/
