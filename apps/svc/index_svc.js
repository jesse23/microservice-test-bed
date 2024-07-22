const http = require("http");
const express = require("express");
const net = require("net");
const { Readable } = require("stream");

const app = express();

function throwError() {
  throw new Error("Simulated exception");
}

// Do not end the response to simulate a socket leak
app.get("/established", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Hello world");
  res.write("This response will never end...");
  console.log("This response will never end...");
  // res.end();
});


// NOTE: This requires iptable in linux, and clumsy in windows
// details see readme
app.get("/fin_wait_1", (req, res) => {
    res.writeHead(200, {
      // longer length than actual content, so that the request will hold
      "Content-Length": Buffer.byteLength("Hello, World!" + 10),
    });
    res.write("Hello, World!");
    setTimeout(() => {
        // launch clumsy or iptable before timeout, then the request will hold
        res.end();
    }, 5000);
});

// stream test, not use for now
app.get("/stream_test", (req, res) => {
  try {
    // Create a stream to write the response
    const responseStream = new Readable({
      read() {
        // Simulate the exception
        this.push("Hello, World!");
        throwError();
        // console.log('still run after exception!');
        this.push(null); // End the stream
      },
    });

    responseStream.on("error", (err) => {
      console.error("Stream error:", err);
      /*
            // note: this will crash the serve for both raw nodeJS and express
            // throw err;
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Internal Server Error');
            */
    });

    res.writeHead(200, {
      "Content-Length": Buffer.byteLength("Hello, World!" + "Hello, World!"),
    });
    responseStream.pipe(res);
  } catch (err) {
    console.error(err);
    /*
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        */
  }
});

const httpServer = http.createServer(app);
const _server = httpServer.listen(9090, () => {
  console.log("Proxy server is running on http://localhost:9090");
});
// _server.setTimeout(3000)
