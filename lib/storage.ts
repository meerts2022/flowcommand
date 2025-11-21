import fs from 'fs/promises';
import path from 'path';
import { N8nInstance } from './n8n-client';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'instances.json');

export async function getStoredInstances(): Promise<N8nInstance[]> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is invalid, return empty array
        return [];
    }
}

export async function saveInstance(instance: N8nInstance): Promise<N8nInstance> {
    const instances = await getStoredInstances();

    const existingIndex = instances.findIndex(i => i.id === instance.id);
    if (existingIndex >= 0) {
        instances[existingIndex] = instance;
    } else {
        instances.push(instance);
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(instances, null, 2));
    return instance;
}

export async function deleteInstance(id: string): Promise<void> {
    const instances = await getStoredInstances();
    const filtered = instances.filter(i => i.id !== id);
    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
}
