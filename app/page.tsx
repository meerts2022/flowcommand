import { getStoredInstances } from '@/lib/storage';
import Link from 'next/link';
import { Suspense } from 'react';
import InstanceCard from './components/InstanceCard';

function CardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-6 w-32 bg-slate-800 rounded mb-2"></div>
          <div className="h-4 w-48 bg-slate-800/50 rounded"></div>
        </div>
        <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-800/50 rounded-lg p-3 h-20"></div>
        <div className="bg-slate-800/50 rounded-lg p-3 h-20"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between">
        <div className="h-4 w-24 bg-slate-800/50 rounded"></div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default async function Home() {
  const instances = await getStoredInstances();

  return (
    <main className="min-h-screen p-8 bg-slate-950 text-slate-100">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">FlowCommand</span>
          </h1>
          <p className="text-slate-400">Mission Control for your N8N Fleet</p>
        </div>
        <Link
          href="/settings"
          className="text-sm text-slate-500 hover:text-blue-400 transition-colors"
        >
          Manage Instances →
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <Suspense key={instance.id} fallback={<CardSkeleton />}>
            <InstanceCard instanceConfig={instance} />
          </Suspense>
        ))}

        {/* Add New Instance Card */}
        <Link
          href="/settings"
          className="glass-panel rounded-2xl p-6 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 min-h-[200px]"
        >
          <span className="text-4xl mb-2">+</span>
          <span className="font-medium">Add Instance</span>
        </Link>
      </div>
    </main>
  );
}
