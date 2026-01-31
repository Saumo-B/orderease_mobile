
const https = require('https');

https.get('https://growmystore.in/', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        // Look for background color in style tags or body
        const bgMatch = data.match(/background-color:\s*([^;]+)/i);
        const bgBodyMatch = data.match(/body\s*{[^}]*background(-color)?:\s*([^;]+)/i);
        console.log("Background matches:", bgMatch);
        console.log("Body matches:", bgBodyMatch);

        // Look for hex codes near "background"
        const hexMatches = data.match(/background[^;]*#[0-9a-f]{3,6}/gi);
        console.log("Hex background matches:", hexMatches ? hexMatches.slice(0, 5) : 'None');
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
