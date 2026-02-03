import { Card, CardContent } from '@/components/ui/card';

export default function LessonLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
              <div>
                <div className="h-4 w-32 animate-pulse rounded bg-muted mb-1" />
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Video skeleton */}
        <div className="mb-6">
          <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
        </div>

        {/* Navigation skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Content skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-5 w-24 animate-pulse rounded-full bg-muted mb-3" />
            <div className="h-7 w-3/4 animate-pulse rounded bg-muted mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
