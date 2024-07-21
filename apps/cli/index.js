async function testSocketLeak() {
    // const axios = require( 'axios' ); // or any HTTP client you're using

    try {
        console.log( 'Sending request...' );
        const res = await fetch( 'http://localhost:3000/endless-get' );
        console.log( 'status:', res.status );
        const data = await res.text();
        console.log( 'data:', data );
    } catch ( error ) {
        console.log( 'Error:', error.message );
    }
}

for(let i = 0; i < 100; i++) {
    testSocketLeak();
}