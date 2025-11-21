'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Instance {
    id?: string;
    name: string;
    url: string;
    apiKey: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [instances, setInstances] = useState<Instance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<Instance>({
        id: undefined,
        name: '',
        url: '',
        apiKey: '',
    });

    useEffect(() => {
        fetchInstances();
    }, []);

    const fetchInstances = async () => {
        try {
            const res = await fetch('/api/instances');
            const data = await res.json();
            setInstances(data);
        } catch (error) {
            console.error('Failed to fetch instances', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setFormData({ id: undefined, name: '', url: '', apiKey: '' });
            fetchInstances();
            router.refresh();
        } catch (error) {
            console.error('Failed to save instance', error);
        }
    };

    const handleDelete = async (id: string) => {
        console.log('Deleting instance:', id);
        // Removed confirm dialog as it was causing issues

        try {
            await fetch(`/api/instances/${id}`, { method: 'DELETE' });
            fetchInstances();
            router.refresh();
            window.location.reload(); // Force reload to ensure state is fresh
        } catch (error) {
            console.error('Failed to delete instance', error);
        }
    };

    const handleEdit = (instance: Instance) => {
        setFormData({
            id: instance.id,
            name: instance.name,
            url: instance.url,
            apiKey: instance.apiKey,
        });
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData({ id: undefined, name: '', url: '', apiKey: '' });
    };

    return (
        <main className="min-h-screen p-8 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-gradient">Settings</span>
                        </h1>
                        <p className="text-slate-400">Manage your N8N Instances</p>
                    </div>
                    <Link
                        href="/"
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Add/Edit Instance Form */}
                    <div className="glass-panel p-6 rounded-2xl h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">
                                {formData.id ? 'Edit Instance' : 'Add New Instance'}
                            </h2>
                            {formData.id && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-xs text-slate-400 hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Instance Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Production"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">URL</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://n8n.yourdomain.com"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">API Key</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Your N8N API Key"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                    value={formData.apiKey}
                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full font-medium py-2 rounded-lg transition-colors mt-4 ${formData.id
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                            >
                                {formData.id ? 'Update Instance' : 'Add Instance'}
                            </button>
                        </form>
                    </div>

                    {/* Existing Instances List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-2">Configured Instances</h2>
                        {isLoading ? (
                            <div className="text-slate-500">Loading...</div>
                        ) : instances.length === 0 ? (
                            <div className="glass-panel p-8 rounded-2xl text-center text-slate-500 border-dashed border-slate-800">
                                No instances configured yet.
                            </div>
                        ) : (
                            instances.map((instance) => (
                                <div key={instance.id} className={`glass-panel p-4 rounded-xl flex justify-between items-center group ${formData.id === instance.id ? 'border-blue-500/50 bg-blue-500/5' : ''}`}>
                                    <div>
                                        <h3 className="font-medium text-slate-200">{instance.name}</h3>
                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{instance.url}</p>
                                        <p className="text-xs text-slate-600 font-mono mt-1">
                                            Key: ••••••••{instance.apiKey.slice(-4)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(instance)}
                                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                            title="Edit Instance"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                <path d="m15 5 4 4" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => instance.id && handleDelete(instance.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete Instance"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
