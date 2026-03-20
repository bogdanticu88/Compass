"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { AssessmentDetail } from "@/lib/types";
import {
  ChevronLeft, ChevronRight, ClipboardList, CheckCircle,
  AlertTriangle, ShieldCheck, ShieldAlert, ShieldOff, Loader2,
} from "lucide-react";
import {
  SECTIONS,
  FW_QUESTION_MAP,
  scoreFramework,
  advisoryRiskTier,
  evidenceForControl,
  proposedFindings,
  type Answers,
  type ProposedFinding,
} from "@/lib/questionnaire";

/* ── constants ────────────────────────────────────────────────── */
const FW_LABELS: Record<string, string> = {
  eu_ai_act: "EU AI Act", dora: "DORA",
  iso_42001: "ISO 42001", nist_ai_rmf: "NIST AI RMF", gdpr: "GDPR",
};

const TIER_CONFIG = {
  minimal:      { label: "Minimal Risk",      color: "text-green-400",  border: "border-green-600/30",  bg: "bg-green-600/10",  icon: ShieldCheck },
  limited:      { label: "Limited Risk",      color: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10", icon: ShieldCheck },
  high:         { label: "High Risk",         color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10", icon: ShieldAlert },
  unacceptable: { label: "Unacceptable Risk", color: "text-red-400",    border: "border-red-600/30",    bg: "bg-red-600/10",    icon: ShieldOff   },
} as const;

const SEVERITY_STYLE = {
  critical: "bg-red-600/15 text-red-400 border-red-600/30",
  high:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium:   "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
};

/* ── helpers ──────────────────────────────────────────────────── */
function relevantSections(frameworkIds: string[]) {
  const relevant = new Set(frameworkIds.flatMap(fw => FW_QUESTION_MAP[fw] ?? []));
  return SECTIONS.map(s => ({
    ...s,
    questions: s.questions.filter(q => relevant.has(q.id)),
  })).filter(s => s.questions.length > 0);
}

/* ── page ─────────────────────────────────────────────────────── */
type Phase = "questionnaire" | "review";

export default function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [assessment,        setAssessment]        = useState<AssessmentDetail | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [answers,           setAnswers]           = useState<Answers>({});
  const [sectionIdx,        setSectionIdx]        = useState(0);
  const [phase,             setPhase]             = useState<Phase>("questionnaire");
  const [dismissedFindings, setDismissedFindings] = useState<Set<string>>(new Set());
  const [applying,          setApplying]          = useState(false);
  const [applyError,        setApplyError]        = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    api.assessments.get(id)
      .then(a => setAssessment(a))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const sections = assessment ? relevantSections(assessment.frameworks) : [];
  const currentSection = sections[sectionIdx];
  const totalQuestions = sections.reduce((s, sec) => s + sec.questions.length, 0);
  const answeredCount  = Object.keys(answers).length;
  const sectionAnswered = (idx: number) =>
    sections[idx]?.questions.every(q => answers[q.id] !== undefined) ?? false;
  const canGoNext = currentSection?.questions.every(q => answers[q.id] !== undefined);

  const handleAnswer = useCallback((qid: string, score: 0 | 1 | 2 | 3) => {
    setAnswers(prev => ({ ...prev, [qid]: score }));
  }, []);

  function goNext() {
    if (sectionIdx < sections.length - 1) {
      setSectionIdx(i => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (sectionIdx > 0) {
      setSectionIdx(i => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleApply() {
    if (!assessment) return;
    setApplying(true);
    setApplyError(null);

    const findings = proposedFindings(answers).filter(f => !dismissedFindings.has(f.id));
    const controls  = assessment.controls;

    // Build evidence payloads for each control
    const uploads = controls.map(ctrl => ({
      control_id: ctrl.id,
      payload: evidenceForControl(ctrl.framework, ctrl.article_ref, answers),
    })).filter(u => u.payload.length > 0);

    try {
      await Promise.all(
        uploads.map(u =>
          api.evidence.upload({ assessment_id: id, control_id: u.control_id, payload: u.payload })
        )
      );

      // If there are critical/high findings to include, redirect with a flag
      // (findings will be shown on the detail page)
      const findingCount = findings.length;
      router.push(`/assessments/${id}?applied=1&findings=${findingCount}`);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply evidence");
      setApplying(false);
    }
  }

  /* ── loading / error ─────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-zinc-500 text-sm animate-pulse">Loading assessment…</div>
    </div>
  );

  if (!assessment) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <p className="text-red-400 text-sm">Assessment not found.</p>
    </div>
  );

  if (sections.length === 0) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center flex-col gap-4">
      <p className="text-zinc-400 text-sm">No questionnaire questions found for the selected frameworks.</p>
      <Link href={`/assessments/${id}`} className="text-blue-400 text-sm hover:underline">Back to assessment</Link>
    </div>
  );

  /* ── nav header (shared) ─────────────────────────────────────── */
  const NavHeader = () => (
    <header className="border-b border-zinc-800 px-6 py-4 flex items-center gap-4 sticky top-0 bg-[#09090b]/95 backdrop-blur z-10">
      <Link href={`/assessments/${id}`} className="text-zinc-500 hover:text-zinc-300 transition-colors">
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
      <Link href={`/assessments/${id}`} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-mono">
        {id.slice(0, 8)}
      </Link>
      <span className="text-zinc-700">/</span>
      <span className="text-sm text-zinc-400">Questionnaire</span>
    </header>
  );

  /* ── review / results screen ─────────────────────────────────── */
  if (phase === "review") {
    const tier      = advisoryRiskTier(answers);
    const tierConf  = TIER_CONFIG[tier];
    const TierIcon  = tierConf.icon;
    const findings  = proposedFindings(answers);
    const active    = findings.filter(f => !dismissedFindings.has(f.id));
    const frameworks = [...new Set(assessment.controls.map(c => c.framework))];

    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-50">
        <NavHeader />
        <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

          <div>
            <h1 className="text-2xl font-bold text-zinc-50">Assessment Results</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Review the advisory findings before applying evidence to the assessment.
            </p>
          </div>

          {/* Advisory risk tier */}
          <div className={`border rounded-xl p-5 ${tierConf.border} ${tierConf.bg}`}>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-medium">Advisory Risk Tier</p>
            <div className="flex items-center gap-3">
              <TierIcon className={`w-7 h-7 ${tierConf.color}`} />
              <div>
                <p className={`text-xl font-bold ${tierConf.color}`}>{tierConf.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Based on {answeredCount} of {totalQuestions} questions · you can override in system settings
                </p>
              </div>
            </div>
          </div>

          {/* Per-framework compliance */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <p className="text-sm font-semibold text-zinc-300">Framework Compliance</p>
            {frameworks.map(fw => {
              const score = scoreFramework(fw, answers);
              const pct   = score !== null ? Math.round(score * 100) : 0;
              const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-400" : pct >= 40 ? "bg-orange-500" : "bg-red-500";
              return (
                <div key={fw}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-400">{FW_LABELS[fw] ?? fw}</span>
                    <span className="text-sm font-medium text-zinc-300">{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proposed findings */}
          {findings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-300">
                  Proposed Findings
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    {active.length} included · {findings.length - active.length} dismissed
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                {findings.map(f => {
                  const dismissed = dismissedFindings.has(f.id);
                  return (
                    <div key={f.id}
                      className={`border rounded-xl p-4 transition-opacity ${dismissed ? "opacity-40" : ""} ${
                        f.severity === "critical" ? "bg-red-950/20 border-red-900/30" :
                        f.severity === "high" ? "bg-orange-950/20 border-orange-900/30" :
                        "bg-zinc-900 border-zinc-800"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_STYLE[f.severity]}`}>
                              {f.severity}
                            </span>
                            {f.controls.slice(0, 2).map((c, i) => (
                              <span key={i} className="text-xs text-zinc-600 font-mono">
                                {FW_LABELS[c.framework] ?? c.framework} {c.articleRef}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed">{f.questionText}</p>
                          <p className="text-xs text-zinc-500 mt-1">{f.answerLabel}</p>
                        </div>
                        <button
                          onClick={() => setDismissedFindings(prev => {
                            const next = new Set(prev);
                            if (dismissed) next.delete(f.id); else next.add(f.id);
                            return next;
                          })}
                          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            dismissed
                              ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-600/40"
                          }`}>
                          {dismissed ? "Include" : "Dismiss"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {applyError && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {applyError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-sm transition-colors">
              {applying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Applying evidence…</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Apply to Assessment</>
              )}
            </button>
            <button
              onClick={() => { setPhase("questionnaire"); setSectionIdx(sections.length - 1); }}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors">
              Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── questionnaire screen ────────────────────────────────────── */
  const globalProgress = answeredCount / totalQuestions;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">
      <NavHeader />

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* overall progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span>{answeredCount} of {totalQuestions} questions answered</span>
            <span>{Math.round(globalProgress * 100)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-blue-500 transition-all"
              style={{ width: `${globalProgress * 100}%` }} />
          </div>
        </div>

        {/* section tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => setSectionIdx(idx)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                idx === sectionIdx
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                  : sectionAnswered(idx)
                  ? "bg-green-600/10 border-green-600/30 text-green-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              }`}>
              {idx + 1}. {sec.title}
              {sectionAnswered(idx) && idx !== sectionIdx && (
                <CheckCircle className="inline w-3 h-3 ml-1.5 -mt-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* current section */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-1">
              Section {sectionIdx + 1} of {sections.length}
            </p>
            <h2 className="text-xl font-bold text-zinc-50">{currentSection.title}</h2>
            <p className="text-sm text-zinc-500 mt-1">{currentSection.description}</p>
          </div>

          {currentSection.questions.map((q, qi) => {
            const selectedScore = answers[q.id];
            return (
              <div key={q.id} className="space-y-3">
                <div>
                  <span className="text-xs font-mono text-zinc-600 mb-1 block">Q{qi + 1}</span>
                  <p className="text-sm font-medium text-zinc-200 leading-relaxed">{q.text}</p>
                  {q.hint && (
                    <p className="text-xs text-zinc-500 mt-1 italic">{q.hint}</p>
                  )}
                </div>
                <div className="space-y-2">
                  {q.answers.map((ans, ai) => {
                    const selected = selectedScore === ans.score;
                    return (
                      <button
                        key={ai}
                        type="button"
                        onClick={() => handleAnswer(q.id, ans.score)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          selected
                            ? "bg-blue-600/15 border-blue-500/60 text-blue-200"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-900"
                        }`}>
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            selected ? "border-blue-400 bg-blue-500" : "border-zinc-600"
                          }`}>
                            {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <p className="text-sm leading-relaxed">{ans.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            onClick={goBack}
            disabled={sectionIdx === 0}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {!canGoNext && (
              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Answer all questions to continue
              </span>
            )}
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="inline-flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg transition-colors">
              {sectionIdx === sections.length - 1 ? "Review Results" : "Next Section"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
