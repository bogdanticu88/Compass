"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { AISystem } from "@/lib/types";
import { ChevronLeft, ClipboardList } from "lucide-react";

const FRAMEWORKS = [
  { id: "eu_ai_act",   label: "EU AI Act",    desc: "European Union AI regulation" },
  { id: "dora",        label: "DORA",         desc: "Digital Operational Resilience Act" },
  { id: "iso_42001",   label: "ISO 42001",    desc: "AI management systems standard" },
  { id: "nist_ai_rmf", label: "NIST AI RMF",  desc: "NIST AI Risk Management Framework" },
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const [systems,    setSystems]    = useState<AISystem[]>([]);
  const [systemId,   setSystemId]   = useState("");
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [dueDate,    setDueDate]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    api.systems.list().then(setSystems).catch(() => router.push("/login"));
  }, [router]);

  function toggle(id: string) {
    setFrameworks(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!systemId || frameworks.length === 0) {
      setError("Select a system and at least one framework.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const a = await api.assessments.create({
        system_id: systemId,
        frameworks,
        due_date: dueDate || undefined,
      });
      router.push(`/assessments/${a.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">

      {/* nav */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center gap-4 sticky top-0 bg-[#09090b]/95 backdrop-blur z-10">
        <Link href="/assessments" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Image src="/compass-logo-dark.jpg" alt="Compass" width={28} height={28}
            className="w-7 h-7 object-contain mix-blend-screen" />
          <span className="font-mono font-semibold text-zinc-50 tracking-tight text-sm">Compass</span>
        </div>
        <span className="text-zinc-700">/</span>
        <div className="flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/assessments" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Assessments
          </Link>
        </div>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-400">New</span>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">New Assessment</h1>
          <p className="text-zinc-500 text-sm mt-1">Select a system and frameworks to start collecting evidence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* System */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">AI System</label>
            <select
              value={systemId}
              onChange={e => setSystemId(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="" className="bg-zinc-900 text-zinc-500">Select a system…</option>
              {systems.map(s => (
                <option key={s.id} value={s.id} className="bg-zinc-900">
                  {s.name}{s.risk_tier ? ` · ${s.risk_tier}` : ""}
                </option>
              ))}
            </select>
            {systems.length === 0 && (
              <p className="text-xs text-zinc-600">No AI systems registered. Add one first.</p>
            )}
          </div>

          {/* Frameworks */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Frameworks</label>
            <p className="text-xs text-zinc-600">Select all frameworks that apply to this assessment</p>
            <div className="grid grid-cols-2 gap-2">
              {FRAMEWORKS.map(fw => {
                const selected = frameworks.includes(fw.id);
                return (
                  <button key={fw.id} type="button" onClick={() => toggle(fw.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? "bg-blue-600/15 border-blue-500/60 text-blue-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                    }`}>
                    <p className="font-medium text-sm">{fw.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{fw.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Due Date <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [color-scheme:dark]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-sm transition-colors">
              {loading ? "Creating…" : "Create Assessment"}
            </button>
            <Link href="/assessments"
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
