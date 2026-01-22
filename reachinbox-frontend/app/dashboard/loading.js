export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    </div>
  );
}
