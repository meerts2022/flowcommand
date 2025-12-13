import { N8nClient, N8nInstance } from '@/lib/n8n-client';
import Link from 'next/link';

async function getInstanceStatus(instance: N8nInstance) {
    try {
        const client = new N8nClient(instance);
        const isHealthy = await client.healthCheck();

        let workflowCount = 0;
        let lastExecutionName = 'None';
        let lastExecutionTime = '-';
        let error = null;

        if (isHealthy) {
            try {
                // Fetch ALL workflows to get accurate count
                // Fetch more executions and sort them by date (API doesn't guarantee order by startedAt)
                const [workflows, executions] = await Promise.all([
                    client.getAllWorkflows(),
                    client.getExecutions(50) // Get more to ensure we catch the latest
                ]);

                let workflowCount = workflows.length;

                if (executions.length > 0) {
                    // Sort executions by startedAt in descending order (most recent first)
                    const sortedExecutions = [...executions].sort((a, b) =>
                        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                    );

                    const lastExec = sortedExecutions[0];
                    const workflow = workflows.find(w => w.id === lastExec.workflowId);
                    lastExecutionName = workflow ? workflow.name : 'Unknown Workflow';

                    // Format date: "DD MMM HH:mm"
                    const date = new Date(lastExec.startedAt);
                    lastExecutionTime = date.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    // Determine execution status more accurately
                    let execStatus: string;
                    if (lastExec.waitTill) {
                        execStatus = 'waiting';
                    } else if (lastExec.status) {
                        execStatus = lastExec.status; // 'error', 'success', etc.
                    } else if (lastExec.finished === false) {
                        execStatus = 'running';
                    } else if (lastExec.finished === true) {
                        // If finished but no explicit status, assume success
                        execStatus = 'success';
                    } else {
                        execStatus = 'unknown';
                    }

                    console.log(`[${instance.name}] Last execution:`, {
                        id: lastExec.id,
                        status: lastExec.status,
                        finished: lastExec.finished,
                        determinedStatus: execStatus
                    });

                    // Return execution status and ID for error tracking
                    return {
                        ...instance,
                        status: isHealthy ? 'online' : 'offline',
                        workflows: workflowCount,
                        lastExecutionName,
                        lastExecutionTime,
                        lastExecutionStatus: execStatus,
                        lastExecutionId: lastExec.id,
                        lastChecked: new Date().toLocaleTimeString(),
                        error,
                    };
                }
            } catch (e) {
                console.error(`Failed to fetch stats for ${instance.name}:`, e);
                error = e instanceof Error ? e.message : 'Unknown error fetching stats';
            }
        }

        return {
            ...instance,
            status: isHealthy ? 'online' : 'offline',
            workflows: workflowCount,
            lastExecutionName,
            lastExecutionTime,
            lastExecutionStatus: undefined,
            lastExecutionId: undefined,
            lastChecked: new Date().toLocaleTimeString(),
            error,
        };
    } catch (e) {
        return {
            ...instance,
            status: 'offline',
            workflows: 0,
            lastExecutionName: '-',
            lastExecutionTime: '-',
            lastExecutionStatus: undefined,
            lastExecutionId: undefined,
            lastChecked: new Date().toLocaleTimeString(),
            error: 'Failed to connect',
        };
    }
}

export default async function InstanceCard({ instanceConfig }: { instanceConfig: N8nInstance }) {
    const instance = await getInstanceStatus(instanceConfig);

    return (
        <Link
            href={`/instances/${instance.id}`}
            className="glass-panel rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group block relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors pr-8">
                        {instance.name}
                    </h2>
                    <p className="text-sm text-slate-500">{instance.url}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${instance.status === 'online'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {instance.status.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-800/50 rounded-lg p-3 relative group/tooltip">
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Workflows</div>
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{instance.workflows}</div>
                        {instance.error && (
                            <div className="text-amber-500 cursor-help">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 hidden group-hover/tooltip:block z-10 shadow-xl break-words">
                                    {instance.error}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Last Execution</div>
                    <div className="flex items-center gap-2">
                        <div className="font-medium text-sm truncate flex-1" title={instance.lastExecutionName}>
                            {instance.lastExecutionName}
                        </div>
                        {instance.lastExecutionStatus === 'error' && instance.lastExecutionId && (
                            <Link
                                href={`/instances/${instance.id}/executions/${instance.lastExecutionId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 hover:scale-110 transition-transform"
                            >
                                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 flex items-center justify-center transition-colors" title="Execution failed - click for details">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </div>
                            </Link>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{instance.lastExecutionTime}</div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
                <span>Last checked: {instance.lastChecked}</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform">View Details →</span>
            </div>
        </Link>
    );
}
