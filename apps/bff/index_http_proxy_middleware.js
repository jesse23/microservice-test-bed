/*
note: use http-proxy-middleware 2.0.6 version which is old. In the latest, the contract becomes:
 * ```js
 * createProxyMiddleware({
 *  on: {
 *    error: (error, req, res, target) => {},
 *    proxyReq: (proxyReq, req, res, options) => {},
 *    proxyReqWs: (proxyReq, req, socket, options) => {},
 *    proxyRes: (proxyRes, req, res) => {},
 *    open: (proxySocket) => {},
 *    close: (proxyRes, proxySocket, proxyHead) => {},
 *    start: (req, res, target) => {},
 *    end: (req, res, proxyRes) => {},
 *    econnreset: (error, req, res, target) => {},
 *  }
 * });
 * ```
*/
const express = require('express');
const http = require('http');
const Agent = require('agentkeepalive');
// const httpProxy = require('http-proxy');
const {
    createProxyMiddleware
} = require('http-proxy-middleware');


const app = express();

// https://github.com/chimurai/http-proxy-middleware/issues/483
// with this fix (__expectHeader), the /reject_directly in index_upload.js will work
// otherwise it will throw ECONNRESET from 2nd request
/*
var moveExpectHeader = function (req, res, next) {
    if (req.headers.expect) {
        req.__expectHeader = req.headers.expect;
        delete req.headers.expect;
    }
    next();
};
app.use(moveExpectHeader);
*/

/*
different agent for testing purpose
const agent = new Agent({
    keepAlive: true,
    maxSockets: 2,
    freeSocketTimeout: 50,
    //keepAliveMsecs: 1000,
    socketActiveTTL: 5000,
});
*/

/*
const agent = http.Agent({
    keepAlive: true,
    maxSockets: 2,
    timeout: 500,
})
*/

const agent = http.Agent({});

app.use(createProxyMiddleware({
    router: () => {
        return 'http://localhost:9090';
    },
    changeOrigin: true,
    cookieDomainRewrite: '',
    agent,
    pathRewrite: path => {
        return path;
    },
    onProxyReq: (proxyReq, req, res, options) => {
        /*
        if (req.__expectHeader) {
            proxyReq.setHeader('Expect', req.__expectHeader);
            proxyReq.setHeader('Connection', 'Keep-Alive');
       }
        */
       // console.log(`Proxying request to ${req.url} with headers:`, proxyReq.getHeaders());
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Received response from ${req.url} with status code:`, proxyRes.statusCode);

        proxyRes.on('end', () => {
            console.log('Proxy response ended.');
            // proxyRes.destroy();
            // proxyRes.socket.end();
        });

        req.on('close', () => {
            console.log('Client request closed during proxy response.');
            // proxyRes.destroy();
            // res.end();
        });


        proxyRes.on('close', () => {
            console.log('Proxy response closed.');
            // proxyRes.destroy();
            // proxyRes.socket.destroy();
            // proxyRes.socket.end();
            // proxyRes.destroy();
        });

        proxyRes.on('error', (err) => {
            console.error('Proxy response error:', err.message);
        });

        proxyRes.on('aborted', () => {
            console.log('Proxy response aborted.');
            // proxyRes.destroy();
        });

        res.on('close', () => {
            console.log('Client response closed during proxy response.');
        });

        // Handle client request cancellation for proxy response
        req.on('aborted', () => {
            console.log('Client request aborted during proxy response.');
            // proxyRes.destroy();
        });
    },
    onClose: (req, socket, head) => {
        console.log('Client disconnected');
    },
    onError: (err, req, res) => {
        console.error('Error occurred:', err.message);
        // res.status(500).send('Proxy error');
    },
    // Right approach - use this for client->gw
    // timeout: 20000,
    // Right approach - use this for downstream
    // proxyTimeout: 20000,
}));

const httpServer = http.createServer(app);
const _server = httpServer.listen(3000, () => {
    console.log('Proxy server is running on http://localhost:3000');
});

// Wrong approach - only covers client->bff, and no way to do resource cleanup in handler
_server.setTimeout(5000, /*(socket) => {
    // console.log('Server timeout reached');
   //  socket.destroy();
// }*/)
