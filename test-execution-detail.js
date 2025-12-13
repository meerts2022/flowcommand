// Test execution detail API call
const instance = {
    name: "N8N CCO",
    url: "https://n8n.cco360.nl/",
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTZmMTMzYi0zNDllLTQxMmYtOWI2Yy1lNTBlYmQwNTMyMjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNzUyOTg1fQ.YD2faTQHaxgMV_XvXqN64YGdU6IZY0NiWmBPLNPKmHk"
};

const executionId = "4538";
const baseUrl = instance.url.replace(/\/$/, '');

console.log(`Testing execution detail fetch for execution ${executionId}...`);
console.log(`URL: ${baseUrl}/api/v1/executions/${executionId}?includeData=true\n`);

try {
    const response = await fetch(
        `${baseUrl}/api/v1/executions/${executionId}?includeData=true`,
        {
            headers: {
                'X-N8N-API-KEY': instance.apiKey,
                'Accept': 'application/json'
            }
        }
    );

    console.log('Response status:', response.status);
    const data = await response.json();

    console.log('\n=== EXECUTION DATA ===');
    console.log('Top level keys:', Object.keys(data));
    console.log('\nFull response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.data) {
        console.log('\n=== NESTED DATA ===');
        console.log('data.data keys:', Object.keys(data.data));

        if (data.data.resultData) {
            console.log('resultData keys:', Object.keys(data.data.resultData));
        }
    }

} catch (error) {
    console.error('Error fetching execution detail:', error);
}
