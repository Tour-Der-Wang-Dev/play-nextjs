import Link from "next/link";
import { cookies } from "next/headers";

async function getStatus() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/ayrshare/status`, { cache: "no-store" });
  // When running in the same origin in Next.js app router, empty string base URL works
  if (!res.ok) return { configured: false } as { configured: boolean };
  return res.json();
}

export default async function DashboardPage() {
  const { configured } = await getStatus();

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-700">Ayrshare Dashboard</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
        </div>

        {!configured ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold text-slate-700">Connect Ayrshare</h2>
            <p className="text-slate-600">Set AYRSHARE_API_KEY (and AYRSHARE_PRIVATE_KEY for JWT) as environment variables to enable Business Plan automation.</p>
            <ul className="mt-3 list-disc pl-6 text-sm text-slate-600">
              <li>We never expose secrets to the browser. Keys are server-only.</li>
              <li>After setting variables, refresh this page.</li>
            </ul>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card title="Profiles" href="/api/ayrshare/profiles" desc="List or create profiles"/>
            <Card title="Post" href="#post" desc="Create or schedule posts"/>
            <Card title="Analytics" href="#analytics" desc="Fetch analytics"/>
          </div>
        )}

        {configured && (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section id="post" className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-700">Create Post</h2>
              <CreatePostForm />
            </section>
            <section id="analytics" className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-700">Social Analytics</h2>
              <AnalyticsForm />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a href={href} className="rounded-lg border border-slate-200 bg-white p-6 transition hover:shadow">
      <div className="text-slate-700 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </a>
  );
}

"use client";
import { useState } from "react";

function CreatePostForm() {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      profileKey: form.get("profileKey") || undefined,
      post: String(form.get("post") || ""),
      platforms: String(form.get("platforms") || "twitter").split(",").map(s => s.trim()).filter(Boolean),
      mediaUrls: String(form.get("mediaUrls") || "").split(",").map(s => s.trim()).filter(Boolean),
      scheduleDate: String(form.get("scheduleDate") || "") || undefined,
      shortenLinks: true,
    };
    const r = await fetch("/api/ayrshare/post", { method: "POST", body: JSON.stringify(payload) });
    const j = await r.json();
    setRes(j);
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-600">Profile Key (optional)</label>
          <input name="profileKey" className="mt-1 w-full rounded border px-3 py-2" placeholder="PROFILE_KEY" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Platforms (comma-separated)</label>
          <input name="platforms" defaultValue="twitter,facebook,instagram,linkedin" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Post</label>
        <textarea name="post" required className="mt-1 w-full rounded border px-3 py-2" rows={3} placeholder="Write your post..." />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-600">Media URLs (comma-separated)</label>
          <input name="mediaUrls" className="mt-1 w-full rounded border px-3 py-2" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Schedule Date (ISO, optional)</label>
          <input name="scheduleDate" className="mt-1 w-full rounded border px-3 py-2" placeholder="2025-01-01T12:00:00Z" />
        </div>
      </div>
      <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{loading ? "Posting..." : "Send Post"}</button>
      {res && (
        <pre className="mt-3 overflow-auto rounded bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(res, null, 2)}</pre>
      )}
    </form>
  );
}

function AnalyticsForm() {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      profileKey: form.get("profileKey") || undefined,
      platforms: String(form.get("platforms") || "twitter,facebook").split(",").map(s => s.trim()).filter(Boolean),
    };
    const r = await fetch("/api/ayrshare/analytics/social", { method: "POST", body: JSON.stringify(payload) });
    const j = await r.json();
    setRes(j);
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-600">Profile Key (optional)</label>
          <input name="profileKey" className="mt-1 w-full rounded border px-3 py-2" placeholder="PROFILE_KEY" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Platforms (comma-separated)</label>
          <input name="platforms" defaultValue="twitter,facebook,instagram,linkedin" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
      </div>
      <button disabled={loading} className="rounded bg-slate-700 px-4 py-2 text-white disabled:opacity-50">{loading ? "Loading..." : "Get Analytics"}</button>
      {res && (
        <pre className="mt-3 overflow-auto rounded bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(res, null, 2)}</pre>
      )}
    </form>
  );
}
