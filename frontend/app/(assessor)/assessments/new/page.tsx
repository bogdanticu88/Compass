"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { AISystem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FRAMEWORKS = [
  { id: "eu_ai_act", label: "EU AI Act" },
  { id: "dora", label: "DORA" },
  { id: "iso_42001", label: "ISO 42001" },
  { id: "nist_ai_rmf", label: "NIST AI RMF" },
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [systemId, setSystemId] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    api.systems.list().then(setSystems).catch(() => router.push("/login"));
  }, [router]);

  function toggleFramework(id: string) {
    setSelectedFrameworks((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!systemId || selectedFrameworks.length === 0) {
      setError("Select a system and at least one framework.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const assessment = await api.assessments.create({
        system_id: systemId,
        frameworks: selectedFrameworks,
      });
      router.push(`/assessments/${assessment.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>AI System</Label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={systemId}
                  onChange={(e) => setSystemId(e.target.value)}
                  required
                >
                  <option value="">Select a system…</option>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Frameworks</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMEWORKS.map((fw) => (
                    <button
                      key={fw.id}
                      type="button"
                      onClick={() => toggleFramework(fw.id)}
                      className={`px-3 py-2 rounded border text-sm text-left transition-colors ${
                        selectedFrameworks.includes(fw.id)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {fw.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating…" : "Create Assessment"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
