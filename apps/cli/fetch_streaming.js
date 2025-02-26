// For Node.js v18+ you can use the built-in fetch.
// If you're using an older Node.js version, install node-fetch:
//   npm install node-fetch
// and uncomment the following line:
// const fetch = require('node-fetch');

const url = 'http://localhost:3000/established';

async function fetchStreaming() {
  try {
    console.log('Sending request...');
    const res = await fetch(url, {
        method: 'POST'
    });

    console.log('Status:', res.status);
    if (!res.ok) {
      console.error(`Request failed with status ${res.status}`);
      return;
    }

    // res.body is a ReadableStream. Create a reader.
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    // This variable holds any partial data between chunks.
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // End of stream.
        break;
      }
      // Decode the current chunk.
      buffer += decoder.decode(value, { stream: true });

      // Example: If your stream sends newline-delimited messages, split on newline.
      let lines = buffer.split('\n');

      // The last item might be incomplete so keep it in the buffer.
      buffer = lines.pop();

      // Process each complete line.
      for (const line of lines) {
        // Trim and log the line.
        if (line.trim().length > 0) {
          console.log('Received:', line);
        }
      }
    }

    // Process any remaining data in the buffer.
    if (buffer.trim()) {
      console.log('Received (final chunk):', buffer);
    }

    console.log('Stream ended.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the async function.
fetchStreaming();