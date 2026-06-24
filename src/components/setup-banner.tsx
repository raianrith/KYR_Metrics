import { AlertCircle } from "lucide-react";

interface SetupBannerProps {
  error?: string;
  isDemo?: boolean;
}

export function SetupBanner({ error, isDemo = true }: SetupBannerProps) {
  return (
    <div className="mb-6 rounded-sm border border-wg-orange/30 bg-wg-orange/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-wg-orange shrink-0 mt-0.5" />
        <div>
          <p className="font-display text-sm text-wg-suede">
            {isDemo
              ? "Demo Mode — Supabase not connected"
              : "Supabase connected — action needed"}
          </p>
          <p className="text-sm text-wg-muted mt-1 font-body normal-case tracking-normal">
            {isDemo ? (
              <>
                Showing sample data. Copy{" "}
                <code className="text-xs bg-white px-1 py-0.5 rounded-sm border border-black/5">
                  .env.example
                </code>{" "}
                to{" "}
                <code className="text-xs bg-white px-1 py-0.5 rounded-sm border border-black/5">
                  .env.local
                </code>
                , add your Supabase credentials, and run the SQL migrations in{" "}
                <code className="text-xs bg-white px-1 py-0.5 rounded-sm border border-black/5">
                  supabase/migrations/
                </code>
                .
              </>
            ) : (
              error ??
              "Your database is connected. Complete any pending setup steps below."
            )}
          </p>
          {error && isDemo && (
            <p className="text-xs text-wg-orange mt-2">Error: {error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
