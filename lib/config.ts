import { N8nInstance } from './n8n-client';

export function getConfiguredInstances(): N8nInstance[] {
    const instances: N8nInstance[] = [];

    // Loop through environment variables to find N8N instances
    // Format: N8N_NAME_1, N8N_URL_1, N8N_KEY_1
    let index = 1;
    while (true) {
        const name = process.env[`N8N_NAME_${index}`];
        const url = process.env[`N8N_URL_${index}`];
        const apiKey = process.env[`N8N_KEY_${index}`];

        if (!name || !url || !apiKey) {
            break;
        }

        instances.push({
            id: `env-${index}`,
            name,
            url,
            apiKey,
        });

        index++;
    }

    // If no instances found in env, return the mock ones for demo
    if (instances.length === 0) {
        return [
            {
                id: 'mock-1',
                name: 'Demo Production',
                url: 'https://n8n.example.com',
                apiKey: 'mock',
            },
            {
                id: 'mock-2',
                name: 'Demo Staging',
                url: 'https://staging.example.com',
                apiKey: 'mock',
            }
        ];
    }

    return instances;
}
