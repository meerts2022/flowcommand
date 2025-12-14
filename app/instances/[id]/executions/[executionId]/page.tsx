import { N8nClient } from '@/lib/n8n-client';
import { auth } from '@/lib/auth';
import { getStoredInstances } from '@/lib/storage';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

// Make page dynamic to avoid caching
export const dynamic = 'force-dynamic';

export default async function ExecutionErrorPage({
    params,
}: {
    params: Promise<{ id: string; executionId: string }>;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const { id, executionId } = await params;
    const instances = await getStoredInstances(session.user.id);
    const instance = instances.find(i => i.id === id);

    if (!instance) {
        notFound();
    }

    const client = new N8nClient(instance);

    let execution;
    let workflows;
    let workflow;

    try {
        execution = await client.getExecutionDetail(executionId);
        console.log('[DEBUG] Execution data:', {
            id: execution.id,
            status: execution.status,
            startedAt: execution.startedAt,
            stoppedAt: execution.stoppedAt,
            workflowId: execution.workflowId,
            hasData: !!execution.data,
            dataKeys: execution.data ? Object.keys(execution.data) : []
        });
    } catch (error) {
        console.error('[ERROR] Failed to fetch execution:', error);
        throw new Error(`Failed to fetch execution ${executionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
        workflows = await client.getAllWorkflows();
        workflow = workflows.find(w => w.id === execution.workflowId);
        console.log('[DEBUG] Workflow found:', workflow?.name || 'Unknown');
    } catch (error) {
        console.error('[ERROR] Failed to fetch workflows:', error);
        workflows = [];
    }

    // Extract error information
    const errorData = execution.data?.resultData?.error;
    const runData = execution.data?.resultData?.runData;
    const lastNodeExecuted = execution.data?.resultData?.lastNodeExecuted;

    // Find failed node
    let failedNode: string | null = null;
    let nodeError: any = null;

    if (runData) {
        for (const [nodeName, nodeExecutions] of Object.entries(runData)) {
            if (nodeExecutions[0]?.error) {
                failedNode = nodeName;
                nodeError = nodeExecutions[0].error;
                break;
            }
        }
    }

    const displayError = nodeError || errorData;

    return (
        <main className="min-h-screen p-8 bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="mb-8">
                <Link href={`/instances/${instance.id}`} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to {instance.name}
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            Execution Error
                        </h1>
                        <p className="text-slate-400">{workflow?.name || 'Unknown Workflow'}</p>
                    </div>
                </div>
            </div>

            {/* Error Summary */}
            <div className="glass-panel rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Error Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div className="text-slate-400 text-sm mb-1">Execution ID</div>
                        <div className="font-mono text-sm">{execution.id}</div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm mb-1">Started</div>
                        <div>{new Date(execution.startedAt).toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm mb-1">Stopped</div>
                        <div>{new Date(execution.stoppedAt).toLocaleString()}</div>
                    </div>
                    {failedNode && (
                        <div>
                            <div className="text-slate-400 text-sm mb-1">Failed Node</div>
                            <div className="font-semibold text-red-400">{failedNode}</div>
                        </div>
                    )}
                    {lastNodeExecuted && (
                        <div>
                            <div className="text-slate-400 text-sm mb-1">Last Node Executed</div>
                            <div>{lastNodeExecuted}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Details */}
            {displayError && (
                <div className="glass-panel rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Error Details</h2>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-4">
                        <div className="text-red-400 font-semibold mb-2">
                            {displayError.message || 'Unknown error'}
                        </div>
                        {displayError.description && (
                            <div className="text-slate-300 text-sm mb-2">{displayError.description}</div>
                        )}
                    </div>

                    {displayError.stack && (
                        <details className="mt-4">
                            <summary className="text-slate-400 cursor-pointer hover:text-slate-300 text-sm">
                                View Stack Trace
                            </summary>
                            <pre className="mt-2 p-4 bg-slate-900/50 rounded text-xs overflow-x-auto text-slate-400 font-mono">
                                {displayError.stack}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            {/* AI Analysis Section */}
            <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">AI-Powered Analysis</h2>
                <p className="text-slate-400 mb-4">
                    Get an AI analysis of this error with suggested fixes and prevention strategies.
                </p>
                <Link
                    href={`/instances/${instance.id}/executions/${execution.id}/analyze`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Analyze Error with AI
                </Link>
            </div>
        </main>
    );
}
