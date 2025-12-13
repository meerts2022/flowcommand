// Quick test for execution 4526
const fetch = require('node-fetch');

const instance = {
    url: "https://n8n.cco360.nl/",
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTZmMTMzYi0zNDllLTQxMmYtOWI2Yy1lNTBlYmQwNTMyMjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNzUyOTg1fQ.YD2faTQHaxgMV_XvXqN64YGdU6IZY0NiWmBPLNPKmHk"
};

const executionId = "4526";  // The one we're trying to analyze

async function test() {
    const url = `${instance.url}/api/v1/executions/${executionId}?includeData=true`;
    console.log('Testing URL:', url);

    const response = await fetch(url, {
        headers: {
            'X-N8N-API-KEY': instance.apiKey,
            'Content-Type': 'application/json'
        }
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 500));
}

test().catch(console.error);
