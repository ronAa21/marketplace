import { Database, Terminal } from "lucide-react";

export function SetupNotice({ error }: { error: string }) {
  return (
    <div className="rounded-xl bg-white p-6 ring-1 ring-amber-500/30">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-700">
          <Database className="size-4.5" />
        </span>
        <div className="space-y-2">
          <h3 className="text-[15px] font-bold">Your database needs setup</h3>
          <p className="text-sm text-muted-foreground">
            Supabase replied: <code className="text-xs">{error}</code>
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Open your Supabase project, go to the{" "}
            <span className="font-semibold text-foreground">SQL Editor</span> and
            run the script in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              supabase/schema.sql
            </code>
            . It creates the <code>listings</code> and <code>messages</code>{" "}
            tables, the <code>listing-images</code> bucket and the RLS policies
            this app relies on.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Terminal className="size-3.5" />
            Then refresh this page.
          </p>
        </div>
      </div>
    </div>
  );
}
