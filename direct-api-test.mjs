// Direct API test to see what's happening
import('node-fetch').then(async ({ default: fetch }) => {
    const instance = {
        url: "https://n8n.cco360.nl/",
        apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTZmMTMzYi0zNDllLTQxMmYtOWI2Yy1lNTBlYmQwNTMyMjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNzUyOTg1fQ.YD2faTQHaxgMV_XvXqN64YGdU6IZY0NiWmBPLNPKmHk"
    };

    const executionId = "4526";
    const baseUrl = instance.url.replace(/\/$/, '');
    const url = `${baseUrl}/api/v1/executions/${executionId}?includeData=true`;

    console.log('Fetching:', url);

    const response = await fetch(url, {
        headers: {
            'X-N8N-API-KEY': instance.apiKey,
            'Content-Type': 'application/json'
        }
    });

    console.log('Status:', response.status);

    if (!response.ok) {
        const error = await response.text();
        console.log('Error:', error);
        return;
    }

    const json = await response.json();
    console.log('\n=== RESPONSE STRUCTURE ===');
    console.log('Top keys:', Object.keys(json));
    console.log('\nFull response (formatted):');
    console.log(JSON.stringify(json, null, 2).substring(0, 2000));
});
