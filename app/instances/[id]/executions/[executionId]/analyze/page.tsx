'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AnalyzeErrorPage({
    params,
}: {
    params: Promise<{ id: string; executionId: string }>;
}) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string; executionId: string } | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isCached, setIsCached] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Resolve params Promise on mount
    useEffect(() => {
        params.then((p) => {
            console.log('[COMPONENT] Params resolved:', p);
            setResolvedParams(p);
        });
    }, [params]);

    const handleAnalyze = async (forceRefresh = false) => {
        if (!resolvedParams) {
            console.error('[ANALYZE] Params not resolved yet!');
            alert('Error: Page not fully loaded yet. Please wait a moment and try again.');
            return;
        }

        console.log('[ANALYZE] Button clicked! forceRefresh:', forceRefresh);
        console.log('[ANALYZE] Instance ID:', resolvedParams.id);
        console.log('[ANALYZE] Execution ID:', resolvedParams.executionId);

        setAnalyzing(true);
        setError(null);

        try {
            console.log('[ANALYZE] Making API call to /api/analyze-error...');
            const response = await fetch(`/api/analyze-error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instanceId: resolvedParams.id,
                    executionId: resolvedParams.executionId,
                    forceRefresh,
                }),
            });

            console.log('[ANALYZE] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[ANALYZE] API Error:', errorText);
                throw new Error(`Failed to analyze error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('[ANALYZE] Analysis received, cached:', data.cached);
            setAnalysis(data.analysis);
            setIsCached(data.cached || false);
        } catch (err) {
            console.error('[ANALYZE] Error occurred:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            console.log('[ANALYZE] Setting analyzing to false');
            setAnalyzing(false);
        }
    };

    // Show loading state while params are being resolved
    if (!resolvedParams) {
        return (
            <main className="min-h-screen p-8 bg-slate-950 text-slate-100">
                <div className="max-w-4xl mx-auto flex items-center justify-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="animate-spin text-6xl mb-4">⚙️</div>
                        <p className="text-slate-400">Loading...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/instances/${resolvedParams.id}/executions/${resolvedParams.executionId}`}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Error Details
                    </Link>

                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <div className="text-4xl">🤖</div>
                        AI Error Analysis
                    </h1>
                    <p className="text-slate-400">
                        Get intelligent insights and suggestions to fix your workflow error
                    </p>
                </div>

                {/* Analysis Trigger */}
                {!analysis && !analyzing && (
                    <div>
                        {/* Info Panel */}
                        <div
                            style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(51, 65, 85, 0.5)',
                                borderRadius: '1rem',
                                padding: '2rem',
                                textAlign: 'center',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Ready to Analyze</h2>
                            <p style={{ color: '#94a3b8', maxWidth: '28rem', margin: '0 auto' }}>
                                Our AI will examine the error details, identify the root cause, and provide actionable suggestions to fix and prevent similar issues.
                            </p>
                        </div>

                        {/* Button - Using SAME style as green button that worked */}
                        <button
                            onClick={() => {
                                console.log('[START ANALYSIS] Button clicked!');
                                handleAnalyze();
                            }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 2rem',
                                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                zIndex: 99999,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="10 8 16 12 10 16 10 8" />
                            </svg>
                            Start AI Analysis
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {analyzing && (
                    <div className="glass-panel rounded-2xl p-8 text-center">
                        <div className="animate-spin text-6xl mb-4">⚙️</div>
                        <h2 className="text-2xl font-semibold mb-2">Analyzing Error...</h2>
                        <p className="text-slate-400">
                            Our AI is examining the execution data and identifying issues
                        </p>
                    </div>
                )}

                {/* Analysis Results */}
                {analysis && (
                    <div className="glass-panel rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">✨</div>
                                <div>
                                    <h2 className="text-2xl font-semibold">Analysis Complete</h2>
                                    <p className="text-slate-400 text-sm">AI-generated insights and recommendations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isCached && (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                                        ⚡ Cached (Instant)
                                    </span>
                                )}
                                {/* Copy to Clipboard Button */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(analysis);
                                        // Show visual feedback
                                        const btn = document.getElementById('copy-btn');
                                        if (btn) {
                                            btn.textContent = '✓';
                                            setTimeout(() => {
                                                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
                                            }, 1500);
                                        }
                                    }}
                                    id="copy-btn"
                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                                    title="Copy analysis to clipboard"
                                    style={{
                                        position: 'relative',
                                        zIndex: 100,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                                {analysis}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => handleAnalyze(true)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                                title="Force fresh AI analysis"
                            >
                                🔄 {isCached ? 'Refresh Analysis' : 'Re-analyze'}
                            </button>
                            <Link
                                href={`/instances/${resolvedParams.id}/executions/${resolvedParams.executionId}`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
                            >
                                View Error Details
                            </Link>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="glass-panel rounded-2xl p-6 border-red-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">⚠️</div>
                            <div>
                                <h2 className="text-xl font-semibold text-red-400">Analysis Failed</h2>
                                <p className="text-slate-400 text-sm">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleAnalyze()}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
