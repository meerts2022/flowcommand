import { prisma } from './prisma'
import { N8nInstance } from './n8n-client'

export async function getStoredInstances(userId: string): Promise<N8nInstance[]> {
    const instances = await prisma.instance.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })

    return instances.map((i): N8nInstance => ({
        id: i.id,
        name: i.name,
        url: i.url,
        apiKey: i.apiKey,
    }))
}

export async function saveInstance(userId: string, instance: N8nInstance): Promise<N8nInstance> {
    const saved = await prisma.instance.upsert({
        where: { id: instance.id },
        update: {
            name: instance.name,
            url: instance.url,
            apiKey: instance.apiKey,
        },
        create: {
            id: instance.id,
            name: instance.name,
            url: instance.url,
            apiKey: instance.apiKey,
            userId,
        }
    })

    return {
        id: saved.id,
        name: saved.name,
        url: saved.url,
        apiKey: saved.apiKey,
    }
}

export async function deleteInstance(userId: string, id: string): Promise<void> {
    await prisma.instance.deleteMany({
        where: {
            id,
            userId // Security: only delete own instances
        }
    })
}

export async function getInstance(userId: string, id: string): Promise<N8nInstance | null> {
    const instance = await prisma.instance.findFirst({
        where: {
            id,
            userId // Security: only get own instances
        }
    })

    if (!instance) return null

    return {
        id: instance.id,
        name: instance.name,
        url: instance.url,
        apiKey: instance.apiKey,
    }
}
