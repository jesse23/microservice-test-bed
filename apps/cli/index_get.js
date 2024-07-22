const url = 'http://localhost:3000/established';
// const url = 'http://localhost:3000/fin_wait_1';


async function sendRequestByFetch() {
    // const axios = require( 'axios' ); // or any HTTP client you're using

    try {
        console.log( 'Sending request...' );
        const res = await fetch( url );
        console.log( 'status:', res.status );
        const data = await res.text();
        console.log( 'data:', data );
    } catch ( error ) {
        console.log( 'Error:', error.message );
    }
}

for(let i = 0; i < 1; i++) {
    sendRequestByFetch();
}