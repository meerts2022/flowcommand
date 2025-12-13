// Test execution detail API - Debug version
const instance = {
    id: "7fa7a3c8-9a5d-4f92-a8c7-7e6f5d8c9b1a",
    name: "N8N CCO",
    url: "https://n8n.cco360.nl/",
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTZmMTMzYi0zNDllLTQxMmYtOWI2Yy1lNTBlYmQwNTMyMjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNzUyOTg1fQ.YD2faTQHaxgMV_XvXqN64YGdU6IZY0NiWmBPLNPKmHk"
};

const executionId = "4538";

// Import the N8nClient to test it directly
import { N8nClient } from './lib/n8n-client.ts';

const client = new N8nClient(instance);

console.log('Testing getExecutionDetail with N8nClient...\n');

try {
    const execution = await client.getExecutionDetail(executionId);

    console.log('✅ Success!');
    console.log('\nExecution keys:', Object.keys(execution));
    console.log('\nExecution ID:', execution.id);
    console.log('Status:', execution.status);
    console.log('Started:', execution.startedAt);
    console.log('Stopped:', execution.stoppedAt);
    console.log('Workflow ID:', execution.workflowId);

    if (execution.data) {
        console.log('\n=== NESTED DATA ===');
        console.log('execution.data keys:', Object.keys(execution.data));

        if (execution.data.resultData) {
            console.log('resultData keys:', Object.keys(execution.data.resultData));
            if (execution.data.resultData.error) {
                console.log('\n⚠️  ERROR DATA FOUND:');
                console.log(JSON.stringify(execution.data.resultData.error, null, 2));
            }
        }
    } else {
        console.log('\n⚠️  No nested data field found');
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
}
