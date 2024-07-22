const http = require('http');
const { Readable } = require('stream');

function generateLargePayload(size) {
  const pattern = Buffer.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  const patternLength = pattern.length;
  const payload = Buffer.alloc(size);
  
  for (let i = 0; i < size; i++) {
    payload[i] = pattern[i % patternLength];
  }
  
  return payload;
}

const url = 'http://localhost:3000/reject_directly';
// const url = 'http://localhost:3000/reject_after_read';
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream', // Adjust as needed
    'Expect': '100-continue',
    'Connection': 'Keep-Alive',
  },
};

const req = http.request(url, options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Create a readable stream from the generated payload
const payload = generateLargePayload(50 * 1024 * 1024); // Adjust size as needed (e.g., 10 MB)
const stream = new Readable();
stream._read = () => {}; // No-op _read implementation
stream.push(payload);
stream.push(null); // Indicate the end of the stream

// Pipe the stream to the request
stream.pipe(req);