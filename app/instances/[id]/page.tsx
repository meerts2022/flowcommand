import { N8nClient, N8nInstance } from '@/lib/n8n-client';
import { auth } from '@/lib/auth';
import { getStoredInstances } from '@/lib/storage';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import ExecutionsTable from './components/ExecutionsTable';

interface Props {
    params: Promise<{ id: string }>;
}

async function getInstanceData(instance: N8nInstance) {
    const client = new N8nClient(instance);
    const isHealthy = await client.healthCheck();

    if (!isHealthy) {
        return {
            instance,
            isHealthy: false,
            workflows: [],
            executions24h: [],
        };
    }

    try {
        // Calculate date 24 hours ago
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const [workflows, executions24h] = await Promise.all([
            client.getAllWorkflows(),
            client.getExecutionsSince(yesterday),
        ]);

        return {
            instance,
            isHealthy: true,
            workflows,
            executions24h,
        };
    } catch (error) {
        console.error('Failed to fetch instance data:', error);
        return {
            instance,
            isHealthy: true, // It is healthy, but data fetch failed
            workflows: [],
            executions24h: [],
            error: error instanceof Error ? error.message : 'Unknown error fetching data',
        };
    }
}

export default async function InstancePage({ params }: Props) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const { id } = await params;
    const instances = await getStoredInstances(session.user.id);
    const instance = instances.find((i) => i.id === id);

    if (!instance) {
        notFound();
    }

    const data = await getInstanceData(instance);
    const { workflows, executions24h, isHealthy, error } = data;

    // Calculate stats
    const totalExecutions = executions24h.length;
    const failedExecutionsCount = executions24h.filter(e => e.status === 'error').length;
    const successRate = totalExecutions > 0
        ? ((executions24h.filter(e => e.status === 'success').length / totalExecutions) * 100).toFixed(1)
        : '-';

    return (
        <main className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <Link
                        href="/"
                        className="text-sm text-slate-500 hover:text-blue-400 transition-colors mb-4 inline-block"
                    >
                        ← Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                {instance.name}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isHealthy
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {isHealthy ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </h1>
                            <p className="text-slate-400">{instance.url}</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <div>
                                <div className="font-semibold">Error Fetching Data</div>
                                <div className="text-sm opacity-90">{error}</div>
                            </div>
                        </div>
                    )}
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-xl">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Workflows</div>
                        <div className="text-3xl font-bold">{workflows.length}</div>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Executions (24h)</div>
                        <div className="text-3xl font-bold">{totalExecutions}</div>
                        <div className="text-xs text-slate-500 mt-2">Last 24 hours</div>
                    </div>
                    <div className="glass-panel p-6 rounded-xl">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Success Rate (24h)</div>
                        <div className="text-3xl font-bold text-emerald-400">{successRate}%</div>
                        <div className="text-xs text-slate-500 mt-2">Based on last 24h</div>
                    </div>
                    <div className="glass-panel p-6 rounded-xl border-red-500/20 bg-red-500/5">
                        <div className="text-red-400 text-xs uppercase tracking-wider mb-1">Failures (24h)</div>
                        <div className="text-3xl font-bold text-red-400">{failedExecutionsCount}</div>
                        <div className="text-xs text-red-400/70 mt-2">Requires attention</div>
                    </div>
                </div>

                {/* Executions Table Component */}
                <ExecutionsTable
                    executions={executions24h}
                    workflows={workflows}
                    instance={instance}
                />
            </div>
        </main>
    );
}
