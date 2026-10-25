import { NextResponse } from "next/server";
import { supabaseEnabled } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Public, secret-free snapshot of how this server is configured, so a broken
 * deploy can be diagnosed from a browser: which storage it uses, whether the
 * AI key is present, and which commit is running.
 */
export async function GET() {
  const hosted = Boolean(process.env.VERCEL);
  return NextResponse.json({
    success: true,
    data: {
      storage: supabaseEnabled() ? "supabase" : hosted ? "none (set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)" : "local .data/",
      ai: Boolean(process.env.ANTHROPIC_API_KEY),
      hosted,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    },
  });
}
