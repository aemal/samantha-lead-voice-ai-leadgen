import KanbanBoard from '@/components/KanbanBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Lead Management Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track your sales leads through the pipeline
          </p>
        </div>
        <KanbanBoard />
      </div>
    </main>
  );
}
