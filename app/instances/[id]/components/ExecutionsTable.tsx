'use client';

import { Execution, Workflow, N8nInstance } from '@/lib/n8n-client';
import { useState, useMemo } from 'react';

interface Props {
    executions: Execution[];
    workflows: Workflow[];
    instance: N8nInstance;
}

export default function ExecutionsTable({ executions, workflows, instance }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('error');
    const [workflowFilter, setWorkflowFilter] = useState<string>('all');

    const getWorkflowName = (workflowId: string) => {
        const wf = workflows.find((w) => w.id === workflowId);
        return wf ? wf.name : 'Unknown Workflow';
    };

    const filteredExecutions = useMemo(() => {
        return executions.filter(exec => {
            const matchesStatus = statusFilter === 'all' || exec.status === statusFilter;
            const matchesWorkflow = workflowFilter === 'all' || exec.workflowId === workflowFilter;
            return matchesStatus && matchesWorkflow;
        });
    }, [executions, statusFilter, workflowFilter]);

    // Get unique workflows that have executions in this list for the filter dropdown
    const activeWorkflows = useMemo(() => {
        const ids = new Set(executions.map(e => e.workflowId));
        return workflows.filter(w => ids.has(w.id)).sort((a, b) => a.name.localeCompare(b.name));
    }, [executions, workflows]);

    return (
        <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                    Execution Log
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={workflowFilter}
                        onChange={(e) => setWorkflowFilter(e.target.value)}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
                    >
                        <option value="all">All Workflows</option>
                        {activeWorkflows.map(wf => (
                            <option key={wf.id} value={wf.id}>{wf.name}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
                    >
                        <option value="all">All Statuses</option>
                        <option value="error">Failed</option>
                        <option value="success">Success</option>
                        <option value="running">Running</option>
                        <option value="waiting">Waiting</option>
                    </select>
                </div>
            </div>

            {filteredExecutions.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    No executions found matching your filters.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400">
                            <tr>
                                <th className="p-4 font-medium">Workflow</th>
                                <th className="p-4 font-medium">Time</th>
                                <th className="p-4 font-medium">Execution ID</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredExecutions.map((exec) => (
                                <tr key={exec.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 font-medium text-slate-200">
                                        <a
                                            href={`${instance.url.replace(/\/$/, '')}/workflow/${exec.workflowId}/executions/${exec.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-blue-400 hover:underline transition-colors flex items-center gap-1"
                                        >
                                            {getWorkflowName(exec.workflowId)}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        </a>
                                    </td>
                                    <td className="p-4 text-slate-400">
                                        {new Date(exec.startedAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {exec.status === 'error' ? (
                                            <a
                                                href={`/instances/${instance.id}/executions/${exec.id}`}
                                                className="font-mono text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors flex items-center gap-2 group"
                                                title="Click to view error details and AI analysis"
                                            >
                                                <span>{exec.id}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 group-hover:scale-110 transition-transform">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <span className="font-mono text-xs text-slate-500">{exec.id}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${exec.status === 'success'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : exec.status === 'error'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {exec.status.charAt(0).toUpperCase() + exec.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
