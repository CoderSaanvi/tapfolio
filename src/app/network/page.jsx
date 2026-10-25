import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerTabBar } from "@/components/ui/OwnerTabBar";
import { ContactRow } from "@/components/network/ContactRow";
import { buildContacts } from "@/lib/contacts";
import { listConversations } from "@/lib/conversations-store";
import { getOwnerProfile } from "@/lib/profiles";
import { listVisitors } from "@/lib/visitors-store";

export const dynamic = "force-dynamic";

async function load(slug) {
  try {
    const [conversations, visitors] = await Promise.all([listConversations(slug), listVisitors(slug)]);
    return { contacts: buildContacts(conversations, visitors), error: false };
  } catch {
    return { contacts: [], error: true };
  }
}

/** Everyone the owner has met, one row per person, newest first. */
export default async function NetworkPage() {
  const owner = await getOwnerProfile().catch(() => undefined);
  if (!owner) redirect("/onboarding");
  const { contacts, error } = await load(owner.slug);
  const companies = new Set(contacts.map((c) => c.company.toLowerCase()).filter(Boolean)).size;

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 pb-32 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Network</h1>
          <p className="text-sm text-ink-2">
            {contacts.length} {contacts.length === 1 ? "person" : "people"}
            {companies > 0 && ` · ${companies} ${companies === 1 ? "company" : "companies"}`}
          </p>
        </div>
        <Link href="/" className="rounded-full border border-line bg-card px-3 py-1.5 font-sys text-xs font-semibold text-ink no-underline">
          ← Share
        </Link>
      </header>

      {error && <p className="rounded-xl bg-scarlet-tint p-4 text-sm text-scarlet-bright">Couldn&apos;t read your network.</p>}

      {contacts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-card p-6 text-center text-sm text-ink-2">
          People show up here when they leave their info on your card, or when you add their name or email to a conversation.
        </p>
      ) : (
        contacts.map((c) => <ContactRow key={c.id} contact={c} />)
      )}
      <OwnerTabBar />
    </main>
  );
}
