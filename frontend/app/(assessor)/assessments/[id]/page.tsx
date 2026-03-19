"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { AssessmentDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EVIDENCE_BADGE: Record<string, "default" | "secondary" | "destructive"> = {
  collected: "default",
  stale: "secondary",
  missing: "destructive",
};

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recollecting, setRecollecting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    api.assessments
      .get(id)
      .then(setAssessment)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await api.assessments.submit(id);
      setAssessment((prev) => (prev ? { ...prev, status: "in_review" } : null));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecollect() {
    setRecollecting(true);
    try {
      await api.assessments.recollect(id);
      window.location.reload();
    } catch {
      // silently ignore — best-effort re-collection
    } finally {
      setRecollecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading…
      </div>
    );
  }
  if (!assessment) {
    return <div className="p-8 text-red-600">Assessment not found.</div>;
  }

  const missing = assessment.controls.filter(
    (c) => c.evidence_status === "missing"
  ).length;
  const total = assessment.controls.length;
  const complete = total - missing;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assessment</h1>
            <p className="text-slate-500 text-sm font-mono">{assessment.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge>{assessment.status}</Badge>
            {assessment.status === "draft" && (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit for Review"}
              </Button>
            )}
            <Button variant="outline" onClick={handleRecollect} disabled={recollecting}>
              {recollecting ? "Collecting…" : "Re-collect evidence"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>
                {complete} of {total} controls complete
              </span>
              <span className={missing > 0 ? "text-red-600" : "text-green-600"}>
                {missing} with missing evidence
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${total > 0 ? (complete / total) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {assessment.controls.map((ctrl) => (
            <Card
              key={ctrl.id}
              className={
                ctrl.evidence_status === "missing" || ctrl.evidence_status === "stale"
                  ? "border-orange-200"
                  : ""
              }
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">
                        {ctrl.framework} · {ctrl.article_ref}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900">{ctrl.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{ctrl.requirement}</p>
                  </div>
                  <Badge variant={EVIDENCE_BADGE[ctrl.evidence_status]}>
                    {ctrl.evidence_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
