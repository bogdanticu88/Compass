"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated, getToken } from "@/lib/auth";
import type { AssessmentDetail } from "@/lib/types";
import {
  ChevronLeft, ClipboardList, CheckCircle, AlertCircle,
  RefreshCw, Download, Send, ChevronDown, ChevronUp, ClipboardCheck,
} from "lucide-react";

const FW_LABELS: Record<string, string> = {
  eu_ai_act: "EU AI Act", dora: "DORA", iso_42001: "ISO 42001",
  nist_ai_rmf: "NIST AI RMF", gdpr: "GDPR",
};

const EVIDENCE_STYLE: Record<string, { pill: string; dot: string }> = {
  collected: { pill: "bg-green-600/15 text-green-400 border-green-600/30",  dot: "bg-green-500" },
  stale:     { pill: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30", dot: "bg-yellow-400" },
  missing:   { pill: "bg-red-600/15 text-red-400 border-red-600/30",       dot: "bg-red-500" },
};

const STATUS_STYLE: Record<string, string> = {
  draft:     "bg-zinc-800 text-zinc-400 border border-zinc-700",
  in_review: "bg-blue-600/20 text-blue-400 border border-blue-600/30",
  complete:  "bg-green-600/20 text-green-400 border border-green-600/30",
};

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [assessment,     setAssessment]     = useState<AssessmentDetail | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [recollecting,   setRecollecting]   = useState(false);
  const [evidenceInputs, setEvidenceInputs] = useState<Record<string, string>>({});
  const [saving,         setSaving]         = useState<Record<string, boolean>>({});
  const [expanded,       setExpanded]       = useState<Record<string, boolean>>({});
  const [activeTab,      setActiveTab]      = useState<string>("");
  const [dlError,        setDlError]        = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    api.assessments.get(id)
      .then(a => { setAssessment(a); setActiveTab([...new Set(a.controls.map(c => c.framework))][0] ?? ""); })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await api.assessments.submit(id);
      setAssessment(prev => prev ? { ...prev, status: "in_review" } : null);
    } finally { setSubmitting(false); }
  }

  async function handleRecollect() {
    setRecollecting(true);
    try { await api.assessments.recollect(id); window.location.reload(); }
    catch { /* best-effort */ }
    finally { setRecollecting(false); }
  }

  async function handleDownload(format: "json" | "pdf") {
    setDlError(null);
    const token = getToken();
    const res = await fetch(api.reports.downloadUrl(id, format), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) { setDlError("Failed to download report."); return; }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `compass-report-${id}.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleEvidenceSave(controlId: string) {
    const payload = evidenceInputs[controlId]?.trim();
    if (!payload) return;
    setSaving(prev => ({ ...prev, [controlId]: true }));
    try {
      await api.evidence.upload({ assessment_id: id, control_id: controlId, payload });
      setAssessment(prev => prev ? {
        ...prev,
        controls: prev.controls.map(c =>
          c.id === controlId ? { ...c, evidence_status: "collected", evidence_payload: payload, evidence_source: "manual" } : c
        ),
      } : null);
      setEvidenceInputs(prev => ({ ...prev, [controlId]: "" }));
    } catch { /* user can retry */ }
    finally { setSaving(prev => ({ ...prev, [controlId]: false })); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-zinc-500 text-sm animate-pulse">Loading assessment…</div>
    </div>
  );
  if (!assessment) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <p className="text-red-400">Assessment not found.</p>
    </div>
  );

  const frameworks = [...new Set(assessment.controls.map(c => c.framework))];
  const byFw = Object.fromEntries(
    frameworks.map(fw => [fw, assessment.controls.filter(c => c.framework === fw)])
  );
  const total    = assessment.controls.length;
  const missing  = assessment.controls.filter(c => c.evidence_status === "missing").length;
  const complete = total - missing;
  const pct      = total > 0 ? Math.round((complete / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">

      {/* nav */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#09090b]/95 backdrop-blur z-10">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/assessments" className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Image src="/compass-logo-dark.jpg" alt="Compass" width={28} height={28}
              className="w-7 h-7 object-contain mix-blend-screen" />
            <span className="font-mono font-semibold text-zinc-50 tracking-tight text-sm">Compass</span>
          </div>
          <span className="text-zinc-700 flex-shrink-0">/</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ClipboardList className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/assessments" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Assessments
            </Link>
          </div>
          <span className="text-zinc-700 flex-shrink-0">/</span>
          <span className="text-sm text-zinc-400 font-mono truncate">{assessment.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[assessment.status]}`}>
            {assessment.status === "in_review" ? "In Review" : assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* action bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-50">Assessment Detail</h1>
            <p className="text-xs text-zinc-600 font-mono mt-0.5">{assessment.id}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleRecollect} disabled={recollecting}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${recollecting ? "animate-spin" : ""}`} />
              {recollecting ? "Collecting…" : "Re-collect"}
            </button>
            <button onClick={() => handleDownload("json")}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button onClick={() => handleDownload("pdf")}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            {assessment.status === "draft" && (
              <button onClick={handleSubmit} disabled={submitting}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition-colors">
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Submitting…" : "Submit for Review"}
              </button>
            )}
          </div>
        </div>

        {dlError && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
            {dlError}
          </p>
        )}

        {/* progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-zinc-400">
              <span className="font-semibold text-zinc-100">{complete}</span>
              <span className="text-zinc-600"> / {total} controls</span>
            </span>
            <div className="flex items-center gap-4">
              {missing > 0 ? (
                <span className="flex items-center gap-1 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" /> {missing} missing evidence
                </span>
              ) : total > 0 ? (
                <span className="flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" /> All evidence collected
                </span>
              ) : null}
              <span className="text-zinc-500 text-xs font-medium">{pct}%</span>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div className="h-2 rounded-full transition-all bg-blue-500"
              style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {assessment.frameworks.map(fw => (
              <span key={fw} className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-full">
                {FW_LABELS[fw] ?? fw}
              </span>
            ))}
            {assessment.due_date && (
              <span className="text-xs bg-zinc-800 text-zinc-500 border border-zinc-700 px-2.5 py-1 rounded-full">
                Due: {assessment.due_date}
              </span>
            )}
          </div>
        </div>

        {/* guided questionnaire banner */}
        <div className="flex items-center justify-between gap-4 bg-blue-600/10 border border-blue-500/30 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-300">Guided Questionnaire</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Answer {assessment.frameworks.length > 0 ? "25–38" : "38"} questions and let Compass auto-fill all evidence fields for you.
              </p>
            </div>
          </div>
          <Link href={`/assessments/${id}/questionnaire`}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Start
          </Link>
        </div>

        {/* framework tabs */}
        {frameworks.length > 1 && (
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {frameworks.map(fw => {
              const fwMissing = byFw[fw].filter(c => c.evidence_status === "missing").length;
              return (
                <button key={fw} onClick={() => setActiveTab(fw)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === fw ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                  }`}>
                  {FW_LABELS[fw] ?? fw}
                  {fwMissing > 0 && (
                    <span className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-1.5 py-0.5 rounded-full leading-none">
                      {fwMissing}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* controls */}
        <div className="space-y-2">
          {(byFw[activeTab] ?? []).map(ctrl => {
            const style  = EVIDENCE_STYLE[ctrl.evidence_status];
            const isOpen = expanded[ctrl.id];
            const needsEvidence = ctrl.evidence_status === "missing" || ctrl.evidence_status === "stale";
            return (
              <div key={ctrl.id}
                className={`bg-zinc-900 border rounded-xl transition-colors ${
                  ctrl.evidence_status === "missing" ? "border-red-900/40" :
                  ctrl.evidence_status === "stale"   ? "border-yellow-400/20" :
                  "border-zinc-800"
                }`}>

                {/* header row — always visible */}
                <button className="w-full flex items-start justify-between gap-4 p-4 text-left"
                  onClick={() => setExpanded(prev => ({ ...prev, [ctrl.id]: !prev[ctrl.id] }))}>
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-zinc-600 mb-0.5">
                        {FW_LABELS[ctrl.framework] ?? ctrl.framework} · {ctrl.article_ref}
                      </p>
                      <p className="text-sm font-medium text-zinc-200">{ctrl.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${style.pill}`}>
                      {ctrl.evidence_status}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                  </div>
                </button>

                {/* expanded body */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-3">
                    <p className="text-sm text-zinc-500 leading-relaxed">{ctrl.requirement}</p>

                    {ctrl.evidence_status === "collected" && ctrl.evidence_payload && (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          Evidence collected{ctrl.evidence_source ? ` via ${ctrl.evidence_source}` : ""}
                        </p>
                        <pre className="text-xs text-zinc-400 overflow-auto max-h-36 whitespace-pre-wrap break-words leading-relaxed">
                          {ctrl.evidence_payload}
                        </pre>
                      </div>
                    )}

                    {needsEvidence && (
                      <div className="space-y-2">
                        <textarea
                          value={evidenceInputs[ctrl.id] ?? ""}
                          onChange={e => setEvidenceInputs(prev => ({ ...prev, [ctrl.id]: e.target.value }))}
                          placeholder="Paste evidence, notes, links, or policy references…"
                          rows={3}
                          className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 placeholder:text-zinc-600 text-sm rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleEvidenceSave(ctrl.id)}
                          disabled={!evidenceInputs[ctrl.id]?.trim() || saving[ctrl.id]}
                          className="text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg transition-colors">
                          {saving[ctrl.id] ? "Saving…" : "Save evidence"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
