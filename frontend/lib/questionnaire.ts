/* ─────────────────────────────────────────────────────────────
   Compass — Guided Assessment Questionnaire
   38 questions · 9 sections · 4 options each (scored 0–3)
   Covers: EU AI Act, DORA, ISO 42001, NIST AI RMF, GDPR
───────────────────────────────────────────────────────────── */

export interface Answer {
  label: string;
  score: 0 | 1 | 2 | 3;
  evidence: string; // auto-generated evidence text for this answer
}

export interface Question {
  id: string;
  text: string;
  hint?: string;
  answers: [Answer, Answer, Answer, Answer];
  // which framework controls this question feeds into
  controls: Array<{ framework: string; articleRef: string }>;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

/* ── framework weights per section ──────────────────────────
   Used to compute per-framework compliance scores.
   Value = max possible score contribution from that framework's
   relevant questions (= number of relevant questions × 3).
────────────────────────────────────────────────────────────── */
export const FW_QUESTION_MAP: Record<string, string[]> = {
  eu_ai_act:   ["q1","q2","q3","q4","q5","q9","q10","q11","q14","q15","q16","q17","q18","q19","q20","q22","q23","q26","q27","q30","q31"],
  dora:        ["q5","q6","q7","q8","q22","q23","q24","q25","q26","q27","q28","q29"],
  iso_42001:   ["q3","q10","q11","q15","q16","q18","q20","q30","q31","q32","q33","q34"],
  nist_ai_rmf: ["q1","q2","q3","q9","q10","q11","q12","q13","q17","q19","q20","q21","q30","q31","q32","q34"],
  gdpr:        ["q4","q5","q6","q14","q15","q33","q34","q35","q36","q37","q38"],
};

export const SECTIONS: Section[] = [

  /* ── Section 1: Purpose & Scope ─────────────────────────── */
  {
    id: "s1",
    title: "Purpose & Scope",
    description: "Understanding what the AI system does and who it affects.",
    questions: [
      {
        id: "q1",
        text: "What is the primary function of this AI system?",
        answers: [
          { score: 0, label: "Makes binding autonomous decisions affecting individuals (e.g. credit, hiring, insurance, medical)", evidence: "The system makes autonomous binding decisions that directly affect individuals without mandatory human review. This represents the highest risk category under applicable AI regulations." },
          { score: 1, label: "Supports or ranks options for high-stakes human decisions", evidence: "The system provides ranked recommendations or decision support in high-stakes contexts. A human decision-maker reviews outputs before final decisions are made." },
          { score: 2, label: "Provides suggestions or insights in lower-stakes contexts", evidence: "The system generates suggestions and analytical insights in lower-stakes operational contexts. Outputs inform but do not drive binding decisions." },
          { score: 3, label: "Internal analytics, automation or tooling only — no direct impact on individuals", evidence: "The system is used exclusively for internal operations, automation, or analytics. It does not directly produce outputs that affect individuals outside the organisation." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 9" },
          { framework: "nist_ai_rmf", articleRef: "MAP 1.1" },
        ],
      },
      {
        id: "q2",
        text: "Who are the primary subjects or users of this AI system?",
        answers: [
          { score: 0, label: "Members of the public with no meaningful ability to opt out", evidence: "The system affects members of the general public who have no practical ability to opt out of its use. This requires the highest standards of transparency and fairness." },
          { score: 1, label: "Customers or employees with limited opt-out options", evidence: "The system affects customers or employees. Opt-out mechanisms exist in principle but are limited in practice, requiring clear disclosure and fairness controls." },
          { score: 2, label: "Internal staff who are informed of its use", evidence: "The system is used by or on internal staff who have been informed of its purpose and operation. Consent and awareness mechanisms are in place." },
          { score: 3, label: "Internal technical or operational users only, with full awareness", evidence: "The system is used exclusively by technical or operational staff with full awareness of its capabilities, limitations, and use context." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 13" },
          { framework: "nist_ai_rmf", articleRef: "MAP 1.1" },
        ],
      },
      {
        id: "q3",
        text: "Has a formal AI risk assessment been conducted for this system?",
        answers: [
          { score: 0, label: "No formal or informal assessment has been conducted", evidence: "No AI risk assessment has been conducted for this system. This is a critical gap requiring immediate remediation to meet regulatory obligations." },
          { score: 1, label: "An informal internal review was carried out, but not documented", evidence: "An informal internal review of AI risks was conducted but results were not formally documented. A structured, documented risk assessment is required." },
          { score: 2, label: "A structured risk assessment was completed but not yet formally approved", evidence: "A structured AI risk assessment has been completed and documents identified risks and mitigations, though formal sign-off is pending." },
          { score: 3, label: "A documented risk assessment is complete, approved, and under regular review", evidence: "A comprehensive, formally documented AI risk assessment has been completed, approved by appropriate stakeholders, and is subject to periodic review." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 9" },
          { framework: "iso_42001", articleRef: "6.1" },
          { framework: "nist_ai_rmf", articleRef: "GOVERN 1.1" },
        ],
      },
      {
        id: "q4",
        text: "What categories of personal data does this system process?",
        hint: "Select the most sensitive category that applies.",
        answers: [
          { score: 0, label: "Special category data: health, biometric, racial/ethnic origin, financial, or criminal data", evidence: "The system processes special category personal data as defined under GDPR Art. 9, including sensitive categories such as health, biometric, or financial data. This triggers heightened obligations including explicit consent or a specific exemption, and mandatory DPIA." },
          { score: 1, label: "Regular personal data: names, contact details, behavioural or location data", evidence: "The system processes personal data including identifiers, contact information, and behavioural data. Standard GDPR obligations apply including lawful basis, transparency, and data subject rights." },
          { score: 2, label: "Pseudonymised data where re-identification risk is low but possible", evidence: "The system processes pseudonymised personal data. Re-identification risk has been assessed as low, though GDPR obligations continue to apply as the data remains personal data." },
          { score: 3, label: "No personal data — fully anonymised or synthetic data only", evidence: "The system does not process personal data. All data is either fully anonymised (not reversible) or synthetic. GDPR obligations for data processing do not apply." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 5" },
          { framework: "eu_ai_act", articleRef: "Art. 10" },
        ],
      },
    ],
  },

  /* ── Section 2: Data Governance ─────────────────────────── */
  {
    id: "s2",
    title: "Data Governance",
    description: "How data is managed, validated, and protected throughout the system lifecycle.",
    questions: [
      {
        id: "q5",
        text: "How is training and operational data validated for quality and bias?",
        answers: [
          { score: 0, label: "No data validation or bias testing is performed", evidence: "No data quality validation or bias testing processes are in place. This represents a significant risk to model reliability, fairness, and regulatory compliance." },
          { score: 1, label: "Ad hoc checks are done by developers with no formal process", evidence: "Data quality checks are performed informally by developers on an ad hoc basis. No standardised validation framework or bias testing methodology is applied." },
          { score: 2, label: "A defined validation process exists and is partially documented", evidence: "A defined data validation and bias testing process exists and is documented in part. The process covers key data pipelines though not all edge cases are addressed." },
          { score: 3, label: "Formal, documented data quality and bias testing runs on every release cycle", evidence: "A comprehensive, formally documented data quality and bias testing framework is applied to all training and operational data. Testing occurs at every release cycle and results are reviewed and signed off." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 10" },
          { framework: "dora", articleRef: "Art. 8" },
          { framework: "gdpr", articleRef: "Art. 5" },
        ],
      },
      {
        id: "q6",
        text: "What is the data retention policy for personal data processed by this system?",
        answers: [
          { score: 0, label: "No retention policy — data is kept indefinitely", evidence: "No data retention policy exists. Personal data is retained indefinitely with no scheduled deletion or review. This is non-compliant with GDPR storage limitation principles." },
          { score: 1, label: "Informal practice of deletion but no documented timelines", evidence: "Data deletion occurs informally without documented retention periods or automated enforcement. Compliance with storage limitation principles cannot be demonstrated." },
          { score: 2, label: "Documented retention periods exist but enforcement is inconsistent", evidence: "Data retention periods are documented for this system's data categories, though enforcement relies on manual processes that are not consistently applied." },
          { score: 3, label: "Automated retention enforcement with deletion aligned to processing purpose", evidence: "Automated data retention policies are in place with deletion schedules aligned to the documented processing purpose. Retention periods are reviewed periodically and deletion is logged." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 5" },
          { framework: "gdpr", articleRef: "Art. 30" },
          { framework: "dora", articleRef: "Art. 9" },
        ],
      },
      {
        id: "q7",
        text: "How is access to system data and model outputs controlled?",
        answers: [
          { score: 0, label: "No access controls — data is broadly accessible", evidence: "No access controls are implemented. System data and outputs are broadly accessible without authentication or authorisation, representing a critical security and data protection gap." },
          { score: 1, label: "Basic password protection without role differentiation", evidence: "Basic password-based access control is in place. Role-based differentiation and access logging are absent, limiting the ability to enforce least-privilege principles." },
          { score: 2, label: "Role-based access control with audit logging for key operations", evidence: "Role-based access controls are implemented, limiting data access to authorised roles. Audit logging captures key operations, though coverage is not comprehensive." },
          { score: 3, label: "Strict RBAC with MFA, least-privilege enforcement, and full audit trails", evidence: "Strict role-based access controls are enforced with multi-factor authentication and least-privilege principles. Comprehensive audit trails log all data access and output queries." },
        ],
        controls: [
          { framework: "dora", articleRef: "Art. 9" },
          { framework: "gdpr", articleRef: "Art. 32" },
          { framework: "eu_ai_act", articleRef: "Art. 12" },
        ],
      },
      {
        id: "q8",
        text: "How are third-party components (models, APIs, datasets) assessed for risk?",
        answers: [
          { score: 0, label: "Third-party components are used without any risk assessment", evidence: "No risk assessment is conducted for third-party AI models, APIs, or datasets used in this system. Supply chain risks, data quality, and compliance obligations of third parties are unverified." },
          { score: 1, label: "Informal review of major third-party components only", evidence: "Informal risk reviews are conducted for major third-party components, but smaller dependencies are not assessed. There is no structured third-party risk management process." },
          { score: 2, label: "Basic due diligence conducted with documented findings", evidence: "Basic due diligence is conducted for third-party components, with findings documented. Assessment covers primary data and model providers, though a formal methodology is not consistently applied." },
          { score: 3, label: "Formal third-party risk assessment for all components with contractual safeguards", evidence: "A formal third-party risk assessment process covers all external models, APIs, and datasets. Assessments are documented, contractual safeguards (DPA, SLAs) are in place, and assessments are reviewed periodically." },
        ],
        controls: [
          { framework: "dora", articleRef: "Art. 28" },
          { framework: "eu_ai_act", articleRef: "Art. 9" },
        ],
      },
    ],
  },

  /* ── Section 3: Privacy & GDPR ──────────────────────────── */
  {
    id: "s3",
    title: "Privacy & GDPR",
    description: "Lawful basis, data subject rights, and privacy-by-design obligations.",
    questions: [
      {
        id: "q9",
        text: "What is the lawful basis for processing personal data in this AI system?",
        answers: [
          { score: 0, label: "No lawful basis has been identified or documented", evidence: "No lawful basis for personal data processing has been identified or documented. Processing without a valid lawful basis constitutes a fundamental GDPR violation requiring immediate remediation." },
          { score: 1, label: "Legitimate interests are assumed but a formal LIA has not been conducted", evidence: "Legitimate interests is assumed as the lawful basis, but a Legitimate Interests Assessment (LIA) balancing test has not been formally conducted or documented." },
          { score: 2, label: "A lawful basis is identified and documented but not yet reviewed by legal/DPO", evidence: "A lawful basis has been identified and documented in the records of processing activities. Legal or DPO review is pending." },
          { score: 3, label: "Lawful basis is documented, legally reviewed, and noted in privacy notices", evidence: "A valid lawful basis (consent, contract, legitimate interests with LIA, or legal obligation) is documented, has been reviewed by legal counsel or the DPO, and is stated clearly in relevant privacy notices." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 6" },
          { framework: "eu_ai_act", articleRef: "Art. 13" },
        ],
      },
      {
        id: "q10",
        text: "Are individuals informed when this AI system processes their data or makes decisions about them?",
        answers: [
          { score: 0, label: "No disclosure — individuals are unaware the system exists or processes their data", evidence: "No disclosure is provided to individuals regarding AI processing. This is non-compliant with GDPR transparency obligations and EU AI Act notification requirements." },
          { score: 1, label: "Buried reference in general terms and conditions", evidence: "AI processing is referenced in general terms and conditions only. The disclosure is not prominent, specific, or written in plain language, falling short of GDPR and EU AI Act transparency standards." },
          { score: 2, label: "Disclosed clearly but not at the point of interaction", evidence: "AI processing is disclosed clearly in a privacy policy or pre-contractual information, though not provided directly at the point of data collection or decision." },
          { score: 3, label: "Clear, specific disclosure at the point of data collection and at every decision point", evidence: "Individuals receive clear, specific disclosure that AI processing is taking place at the point of data collection and at every significant decision point. Disclosure is written in plain language and includes the processing purpose and data subject rights." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 13" },
          { framework: "eu_ai_act", articleRef: "Art. 13" },
          { framework: "nist_ai_rmf", articleRef: "GOVERN 2.2" },
        ],
      },
      {
        id: "q11",
        text: "How are data subject rights requests (access, erasure, portability) handled?",
        answers: [
          { score: 0, label: "No process — requests are not handled or not expected", evidence: "No process exists to handle data subject rights requests. The ability to fulfil rights to access, erasure, rectification, or portability is absent, representing a critical GDPR compliance gap." },
          { score: 1, label: "Requests are handled ad hoc with no defined timelines or ownership", evidence: "Data subject rights requests are handled on an ad hoc basis with no defined process, ownership, or response timelines. Compliance with statutory deadlines cannot be guaranteed." },
          { score: 2, label: "A defined process exists but response times are occasionally missed", evidence: "A defined process for handling data subject rights requests exists with assigned ownership. Response timelines are mostly met, though occasional delays occur and the process is not fully automated." },
          { score: 3, label: "Formal process with documented timelines, technical capability, and DPO oversight", evidence: "A formal data subject rights process is in place, with documented response timelines within GDPR deadlines (30 days), technical capability to fulfil all rights, DPO oversight, and audit trail of requests and responses." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 17" },
          { framework: "gdpr", articleRef: "Art. 20" },
          { framework: "iso_42001", articleRef: "8.4" },
        ],
      },
      {
        id: "q12",
        text: "Has a Data Protection Impact Assessment (DPIA) been conducted for this system?",
        answers: [
          { score: 0, label: "No DPIA has been conducted or planned", evidence: "No Data Protection Impact Assessment has been conducted. Given the nature of AI processing, a DPIA is likely required under GDPR Art. 35 and must be completed before or immediately after deployment." },
          { score: 1, label: "A DPIA is planned but not yet started", evidence: "A DPIA has been identified as required and is scheduled, but has not yet been completed. Processing continues without the benefit of the DPIA's risk identification and mitigation." },
          { score: 2, label: "A DPIA has been conducted but not yet reviewed by the DPO or supervisory authority", evidence: "A DPIA has been conducted and documents the risks and mitigation measures for this AI system. DPO or supervisory authority review is pending." },
          { score: 3, label: "A full DPIA is complete, DPO-reviewed, and updated on material system changes", evidence: "A comprehensive DPIA has been conducted, reviewed and approved by the DPO, and is updated whenever material changes are made to the system's processing activities." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 35" },
          { framework: "eu_ai_act", articleRef: "Art. 9" },
        ],
      },
      {
        id: "q13",
        text: "Does the system implement privacy by design — collecting only data necessary for the stated purpose?",
        answers: [
          { score: 0, label: "The system collects all available data without considering necessity", evidence: "The system collects data without applying data minimisation principles. All available data is ingested regardless of necessity for the processing purpose, violating GDPR Art. 25 privacy-by-design obligations." },
          { score: 1, label: "Data minimisation is considered informally but not systematically applied", evidence: "Data minimisation is considered during development on an informal basis. No systematic review ensures that only necessary data is collected and retained." },
          { score: 2, label: "Data minimisation is applied to primary inputs but secondary uses are not reviewed", evidence: "Privacy-by-design principles are applied to the primary data inputs of this system. Secondary data uses and derived outputs have not been systematically reviewed for minimisation." },
          { score: 3, label: "Privacy by design is embedded in the development lifecycle with documented data necessity review", evidence: "Privacy-by-design principles are formally embedded in the system development lifecycle. A documented data necessity review is conducted at design, development, and each release, confirming that only data necessary for the stated purpose is collected and processed." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 25" },
          { framework: "eu_ai_act", articleRef: "Art. 10" },
        ],
      },
    ],
  },

  /* ── Section 4: Human Oversight ─────────────────────────── */
  {
    id: "s4",
    title: "Human Oversight",
    description: "How humans monitor, review, and retain control over AI outputs.",
    questions: [
      {
        id: "q14",
        text: "How are AI-generated decisions or recommendations reviewed by humans?",
        answers: [
          { score: 0, label: "Fully automated — no human reviews outputs before they take effect", evidence: "AI outputs take effect autonomously without any human review. This is non-compliant with GDPR Art. 22 (for decisions significantly affecting individuals) and EU AI Act human oversight requirements." },
          { score: 1, label: "Human override exists in principle but is rarely exercised", evidence: "A human override mechanism exists but is seldom used in practice. Effective human oversight is limited, and the system effectively operates autonomously for most decisions." },
          { score: 2, label: "Human review is required for high-risk outputs before action is taken", evidence: "High-risk or high-impact outputs are routed for human review before action is taken. A defined escalation process distinguishes high-risk from routine outputs." },
          { score: 3, label: "All significant outputs require human sign-off with documented accountability", evidence: "All significant AI outputs require explicit human review and sign-off before taking effect. Accountability is documented, with named reviewers and audit records of each decision." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 14" },
          { framework: "gdpr", articleRef: "Art. 22" },
          { framework: "nist_ai_rmf", articleRef: "GOVERN 1.1" },
        ],
      },
      {
        id: "q15",
        text: "Can affected individuals contest or appeal AI-generated decisions?",
        answers: [
          { score: 0, label: "No appeal or contest mechanism exists", evidence: "No mechanism exists for individuals to contest or appeal AI-generated decisions. This violates GDPR Art. 22 rights against solely automated decision-making and best practice under EU AI Act." },
          { score: 1, label: "Individuals can complain through general channels but there is no AI-specific process", evidence: "General complaints processes exist but there is no AI-specific appeal route. Individuals affected by AI decisions cannot request a meaningful human review." },
          { score: 2, label: "An AI-specific appeal process exists but is not well publicised", evidence: "An AI-specific appeal and review process exists, allowing individuals to contest decisions. The process is functional but not prominently communicated to affected individuals." },
          { score: 3, label: "A clear, accessible appeal process is communicated at the point of every AI decision", evidence: "A clear, accessible appeal and human review process is communicated to individuals at the point of every AI-assisted decision. Requests are logged, reviewed by a human assessor, and outcomes documented." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 14" },
          { framework: "gdpr", articleRef: "Art. 22" },
          { framework: "iso_42001", articleRef: "8.4" },
        ],
      },
      {
        id: "q16",
        text: "Who is responsible for monitoring this AI system's behaviour and performance?",
        answers: [
          { score: 0, label: "No designated owner — responsibility is unclear or absent", evidence: "No individual or team has designated responsibility for monitoring this system's behaviour and performance. Accountability gaps represent a significant governance risk." },
          { score: 1, label: "Responsibility is shared informally across multiple teams with no formal assignment", evidence: "Monitoring responsibility is informally distributed but no individual is formally accountable. This creates gaps in coverage and unclear escalation paths when issues arise." },
          { score: 2, label: "A named system owner exists but monitoring duties are not formally documented", evidence: "A named system owner is responsible for this AI system. Monitoring duties are understood informally but not formally documented in a job description or governance charter." },
          { score: 3, label: "A named owner with documented monitoring duties, SLAs, and regular reporting to governance", evidence: "A named system owner has formally documented monitoring responsibilities, including defined performance thresholds, SLAs, escalation procedures, and regular reporting to the AI governance function." },
        ],
        controls: [
          { framework: "iso_42001", articleRef: "5.2" },
          { framework: "eu_ai_act", articleRef: "Art. 26" },
          { framework: "nist_ai_rmf", articleRef: "GOVERN 2.2" },
        ],
      },
      {
        id: "q17",
        text: "Are staff who use or are affected by this system trained on its capabilities and limitations?",
        answers: [
          { score: 0, label: "No training is provided", evidence: "No training on AI system capabilities, limitations, or appropriate use is provided to staff. This creates risk of over-reliance, misuse, and failure to detect errors." },
          { score: 1, label: "Informal knowledge sharing only — no structured training programme", evidence: "AI system knowledge is shared informally through team conversations and documentation. No structured training programme ensures consistent awareness across all staff who interact with the system." },
          { score: 2, label: "Training is available but not mandatory for all relevant roles", evidence: "Structured training covering system capabilities, limitations, and appropriate use is available. Completion is not mandatory for all relevant roles, resulting in variable awareness levels." },
          { score: 3, label: "Mandatory role-specific training with competency assessment and regular refreshes", evidence: "Mandatory, role-specific training on AI system capabilities, known limitations, bias risks, and proper use is required for all relevant staff. Competency is assessed, completion tracked, and training refreshed when the system is updated." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 26" },
          { framework: "nist_ai_rmf", articleRef: "MAP 2.1" },
        ],
      },
    ],
  },

  /* ── Section 5: Transparency ─────────────────────────────── */
  {
    id: "s5",
    title: "Transparency & Explainability",
    description: "Whether stakeholders can understand how and why the AI system produces its outputs.",
    questions: [
      {
        id: "q18",
        text: "Can this system explain its outputs or decisions in understandable terms?",
        answers: [
          { score: 0, label: "Black box — no explanation of outputs is possible", evidence: "The system is a black box with no capability to generate explanations for its outputs or decisions. This prevents meaningful human oversight and may violate transparency requirements." },
          { score: 1, label: "Technical feature importance available internally — not accessible to users or subjects", evidence: "Technical explanations (e.g. feature importance, SHAP values) are available internally to the development team but are not accessible to operational users or affected individuals." },
          { score: 2, label: "Plain-language explanations are available for some categories of decision", evidence: "Plain-language explanations are generated for certain categories of AI output. Coverage is partial; not all decision types produce explanations accessible to affected individuals." },
          { score: 3, label: "Meaningful, plain-language explanations are automatically generated for all outputs", evidence: "The system automatically generates meaningful, plain-language explanations for all significant outputs. Explanations are accessible to operational users and, where appropriate, to affected individuals." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 13" },
          { framework: "iso_42001", articleRef: "8.2" },
          { framework: "nist_ai_rmf", articleRef: "MEASURE 2.5" },
        ],
      },
      {
        id: "q19",
        text: "Is comprehensive technical documentation maintained for this system?",
        answers: [
          { score: 0, label: "No technical documentation exists", evidence: "No technical documentation (model cards, system cards, architecture documentation) exists for this system. This is non-compliant with EU AI Act Art. 11 for high-risk systems." },
          { score: 1, label: "Informal notes and comments in code — no structured documentation", evidence: "System knowledge exists informally in code comments and team memory. No structured technical documentation is maintained that would support audit, review, or handover." },
          { score: 2, label: "Structured documentation covering core components, partially up to date", evidence: "Structured technical documentation exists covering core system components, model architecture, and data flows. Documentation is partially up to date; some elements reflect earlier system versions." },
          { score: 3, label: "Comprehensive, version-controlled documentation including model card and system card, updated on every release", evidence: "Comprehensive, version-controlled technical documentation is maintained including a model card, system card, architecture diagrams, data flow documentation, and known limitations. Documentation is updated with every release." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 11" },
          { framework: "iso_42001", articleRef: "8.2" },
          { framework: "nist_ai_rmf", articleRef: "MEASURE 1.1" },
        ],
      },
      {
        id: "q20",
        text: "Are the criteria, logic, and data inputs that drive this system's outputs documented?",
        answers: [
          { score: 0, label: "The decision logic and inputs are undocumented", evidence: "The criteria, logic, and data inputs driving this system's outputs are not documented. The system cannot be audited or reviewed without this foundational documentation." },
          { score: 1, label: "Partially documented — key parameters are known but not formally recorded", evidence: "Key decision parameters and data inputs are understood by the core team but not formally documented. Documentation gaps limit the ability to audit or explain outputs." },
          { score: 2, label: "Decision logic and inputs documented internally with version control", evidence: "Decision logic, weighting criteria, and data inputs are documented internally with version control. Documentation is available to authorised reviewers and updated when the model changes." },
          { score: 3, label: "Fully documented, auditable, and reviewed by a second-line function or independent party", evidence: "Decision logic, criteria, weights, and all data inputs are comprehensively documented, version-controlled, and subject to independent review by a second-line function or external auditor." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 11" },
          { framework: "eu_ai_act", articleRef: "Art. 12" },
          { framework: "iso_42001", articleRef: "8.2" },
          { framework: "nist_ai_rmf", articleRef: "MAP 2.1" },
        ],
      },
      {
        id: "q21",
        text: "Has the system been tested for fairness and consistent performance across demographic groups?",
        answers: [
          { score: 0, label: "No fairness or demographic parity testing has been conducted", evidence: "No testing for fairness or differential performance across demographic groups has been conducted. Undetected bias may cause discriminatory outcomes, exposing the organisation to regulatory and legal risk." },
          { score: 1, label: "Tested informally — no documented methodology or results", evidence: "Informal bias and fairness checks have been carried out without a documented methodology. Results are not recorded, preventing systematic review or improvement." },
          { score: 2, label: "Structured fairness testing conducted with documented results but issues remain unresolved", evidence: "Structured fairness and demographic parity testing has been conducted using a documented methodology. Testing identified issues that are recorded but not all have been addressed." },
          { score: 3, label: "Regular structured testing with documented results and a remediation process for identified gaps", evidence: "Regular, structured fairness testing is conducted across protected characteristics. Results are documented, reviewed, and any identified disparities are addressed through a formal remediation process before each release." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 10" },
          { framework: "nist_ai_rmf", articleRef: "MEASURE 2.5" },
          { framework: "nist_ai_rmf", articleRef: "MEASURE 2.6" },
        ],
      },
    ],
  },

  /* ── Section 6: Risk Management ─────────────────────────── */
  {
    id: "s6",
    title: "Risk Management",
    description: "Processes for identifying, mitigating, and managing ongoing AI-related risks.",
    questions: [
      {
        id: "q22",
        text: "How are foreseeable misuse scenarios for this system identified and mitigated?",
        answers: [
          { score: 0, label: "Misuse scenarios have not been considered", evidence: "Foreseeable misuse scenarios have not been identified or assessed. This represents a gap in risk management that could result in harm to individuals or the organisation." },
          { score: 1, label: "Misuse scenarios have been discussed informally but not documented or mitigated", evidence: "Potential misuse scenarios have been discussed informally during development. No formal documentation or implemented mitigations exist." },
          { score: 2, label: "A misuse analysis has been documented but controls are partially implemented", evidence: "A misuse analysis has been conducted and documented. Mitigation controls are designed but not all are fully implemented." },
          { score: 3, label: "Formal misuse analysis with implemented controls, monitored and reviewed periodically", evidence: "A formal misuse analysis documents foreseeable misuse scenarios and adversarial uses. Technical and process controls are implemented to mitigate identified risks and are reviewed periodically." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 9" },
          { framework: "eu_ai_act", articleRef: "Art. 15" },
          { framework: "nist_ai_rmf", articleRef: "MAP 1.1" },
        ],
      },
      {
        id: "q23",
        text: "Is there a process for updating this system when new risks are identified or context changes?",
        answers: [
          { score: 0, label: "No change management process — updates are ad hoc and undocumented", evidence: "No change management process governs updates to this AI system. Changes are deployed ad hoc without documentation, risk re-assessment, or version control." },
          { score: 1, label: "Changes are made by the development team without formal review", evidence: "System changes are made by the development team based on their judgement, without a formal review process, impact assessment, or documentation of the change rationale." },
          { score: 2, label: "A defined change management process exists with documentation but risk re-assessment is inconsistent", evidence: "A defined change management process governs system updates. Changes are documented and reviewed, though risk re-assessment is not consistently applied to all changes." },
          { score: 3, label: "Formal change management with mandatory risk re-assessment, sign-off, and rollback capability", evidence: "A formal change management process is applied to all system updates. Each change requires documented justification, risk re-assessment, stakeholder sign-off, and a tested rollback procedure." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 17" },
          { framework: "iso_42001", articleRef: "8.4" },
          { framework: "dora", articleRef: "Art. 8" },
        ],
      },
      {
        id: "q24",
        text: "How is model performance monitored after deployment?",
        answers: [
          { score: 0, label: "No post-deployment monitoring — performance is assumed to remain stable", evidence: "No post-deployment monitoring is in place. Model performance, accuracy, and bias drift are not tracked, creating risk that deteriorating performance goes undetected." },
          { score: 1, label: "Monitoring relies on user-reported issues with no proactive detection", evidence: "Performance issues are identified reactively through user reports. No automated monitoring or proactive drift detection is in place." },
          { score: 2, label: "Performance dashboards exist with alerts for threshold breaches", evidence: "Performance monitoring dashboards track key metrics with configured alerts for threshold breaches. Drift detection is implemented for primary model outputs." },
          { score: 3, label: "Automated monitoring with drift detection, regular performance reviews, and documented retraining triggers", evidence: "Automated monitoring tracks model performance, data drift, and concept drift. Regular performance reviews are conducted and documented retraining triggers define when model updates are required." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 9" },
          { framework: "nist_ai_rmf", articleRef: "MEASURE 2.6" },
          { framework: "iso_42001", articleRef: "9.1" },
        ],
      },
      {
        id: "q25",
        text: "Does the organisation have a documented AI ethics or responsible AI policy?",
        answers: [
          { score: 0, label: "No AI ethics or responsible AI policy exists", evidence: "No AI ethics or responsible AI policy has been established. Decisions about AI development and deployment are made without a shared ethical framework." },
          { score: 1, label: "High-level principles exist informally but no formal policy document", evidence: "AI ethics principles are shared informally within the organisation but have not been formalised into a policy document with governance oversight." },
          { score: 2, label: "A policy document exists but is not consistently applied or enforced", evidence: "A formal AI ethics or responsible AI policy exists and is published. Application and enforcement are inconsistent, and the policy is not embedded in development and procurement processes." },
          { score: 3, label: "A formal policy applied consistently, with governance oversight and periodic review", evidence: "A formal AI ethics and responsible AI policy is in place, consistently applied across all AI development and deployment activities, subject to governance oversight, and reviewed periodically." },
        ],
        controls: [
          { framework: "iso_42001", articleRef: "4.1" },
          { framework: "nist_ai_rmf", articleRef: "GOVERN 1.1" },
          { framework: "eu_ai_act", articleRef: "Art. 17" },
        ],
      },
    ],
  },

  /* ── Section 7: Security & Resilience ───────────────────── */
  {
    id: "s7",
    title: "Security & Resilience",
    description: "Cybersecurity posture, resilience to failure, and recovery capabilities.",
    questions: [
      {
        id: "q26",
        text: "Has this system undergone cybersecurity and adversarial robustness testing?",
        answers: [
          { score: 0, label: "No security testing has been conducted", evidence: "No cybersecurity or adversarial robustness testing has been conducted on this system. The system's resistance to attacks, prompt injection, model extraction, or adversarial inputs is unknown." },
          { score: 1, label: "Basic vulnerability scanning only — no penetration testing or adversarial ML testing", evidence: "Basic automated vulnerability scans have been run against the system infrastructure. Penetration testing and adversarial machine learning testing (e.g. for prompt injection or model inversion) have not been conducted." },
          { score: 2, label: "Penetration testing conducted but adversarial ML-specific tests are absent", evidence: "Penetration testing has been conducted against system infrastructure and APIs. AI-specific adversarial testing (adversarial examples, model extraction, membership inference) has not been performed." },
          { score: 3, label: "Regular security testing including AI-specific adversarial testing with documented results and remediation", evidence: "Regular security testing is conducted including penetration testing, AI-specific adversarial robustness testing, and API security review. Results are documented and identified vulnerabilities are tracked through to remediation." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 15" },
          { framework: "dora", articleRef: "Art. 10" },
          { framework: "gdpr", articleRef: "Art. 32" },
        ],
      },
      {
        id: "q27",
        text: "What is the recovery capability if this system fails or produces erroneous outputs?",
        answers: [
          { score: 0, label: "No recovery or fallback plan exists", evidence: "No recovery plan, rollback procedure, or fallback mechanism is in place for this system. A failure or erroneous output episode would require improvised response with no defined procedures." },
          { score: 1, label: "Manual recovery is possible but procedures are undocumented", evidence: "Manual system recovery is possible but relies on tacit team knowledge. No documented recovery procedures, runbooks, or tested rollback capability exist." },
          { score: 2, label: "Recovery procedures are documented and a rollback mechanism exists but is untested", evidence: "Recovery procedures are documented and a rollback mechanism is in place to revert to a previous system version. The recovery procedure has not been tested in a controlled exercise." },
          { score: 3, label: "Tested recovery with defined RTO/RPO, automated rollback, and documented lessons learned", evidence: "Recovery procedures are documented and regularly tested. Recovery Time Objective (RTO) and Recovery Point Objective (RPO) are defined. Automated rollback capability is available and post-incident reviews produce documented lessons learned." },
        ],
        controls: [
          { framework: "dora", articleRef: "Art. 11" },
          { framework: "eu_ai_act", articleRef: "Art. 15" },
          { framework: "nist_ai_rmf", articleRef: "MANAGE 1.1" },
        ],
      },
      {
        id: "q28",
        text: "Are there backup or failover mechanisms if this system becomes unavailable?",
        answers: [
          { score: 0, label: "No backup — unavailability would halt dependent business processes", evidence: "No backup or failover mechanisms are in place. System unavailability would halt dependent business processes with no manual or automated alternative." },
          { score: 1, label: "Manual fallback process exists but is informal and burdensome", evidence: "A manual fallback process can be invoked if the system is unavailable, but it is informal, reliant on individual knowledge, and burdensome to execute." },
          { score: 2, label: "Documented manual fallback with partial automation for critical scenarios", evidence: "A documented manual fallback process is in place with partial automation for the most critical failure scenarios. The process is known by relevant staff and can be activated in a defined timeframe." },
          { score: 3, label: "Full automated failover to a secondary system with tested switchover procedures", evidence: "Automated failover to a secondary system or degraded-mode capability is implemented. Switchover procedures are documented and tested in scheduled exercises." },
        ],
        controls: [
          { framework: "dora", articleRef: "Art. 11" },
          { framework: "dora", articleRef: "Art. 17" },
        ],
      },
      {
        id: "q29",
        text: "How are system dependencies (external APIs, cloud services, third-party models) managed?",
        answers: [
          { score: 0, label: "Dependencies are not inventoried or tracked", evidence: "External dependencies are not inventoried or tracked. The impact of a dependency failure or change on this system is unknown and unmanaged." },
          { score: 1, label: "Key dependencies are known informally but no formal register or contingency exists", evidence: "Key external dependencies are known to the development team informally but are not formally inventoried. No contingency plans or SLAs exist for critical dependencies." },
          { score: 2, label: "A dependency register exists with basic SLA monitoring but no contingency plans", evidence: "A register of external dependencies is maintained with basic SLA monitoring. Contingency plans for critical dependency failures have not been developed." },
          { score: 3, label: "Full dependency register with SLAs, contractual safeguards, and tested contingency plans", evidence: "A comprehensive dependency register is maintained for all external APIs, cloud services, and third-party models. SLAs are contractually enforced, dependencies are monitored against SLA thresholds, and contingency plans for critical dependency failures are documented and tested." },
        ],
        controls: [
          { framework: "dora", articleRef: "Art. 28" },
          { framework: "dora", articleRef: "Art. 9" },
        ],
      },
    ],
  },

  /* ── Section 8: Incident Response & Monitoring ──────────── */
  {
    id: "s8",
    title: "Incident Response & Monitoring",
    description: "How the organisation detects, responds to, and learns from AI-related incidents.",
    questions: [
      {
        id: "q30",
        text: "Is there real-time monitoring of this system's performance, outputs, and behaviour?",
        answers: [
          { score: 0, label: "No monitoring — issues are only discovered when reported by users", evidence: "No real-time monitoring is in place. System performance degradation, erroneous outputs, and anomalous behaviour are only discovered reactively through user reports." },
          { score: 1, label: "Basic availability monitoring only — no output quality or drift detection", evidence: "Basic availability monitoring (uptime, error rates) is in place. Output quality monitoring, model drift detection, and behavioural anomaly detection are absent." },
          { score: 2, label: "Performance dashboards with threshold alerts but limited AI-specific monitoring", evidence: "Performance monitoring with threshold-based alerts is implemented. AI-specific monitoring such as prediction confidence tracking, output distribution monitoring, and drift detection is limited." },
          { score: 3, label: "Comprehensive monitoring including drift detection, output auditing, and anomaly alerting with defined response SLAs", evidence: "Comprehensive monitoring covers system availability, output quality, model drift, prediction confidence, and anomaly detection. Alerts have defined response SLAs and are routed to the named system owner." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 12" },
          { framework: "iso_42001", articleRef: "9.1" },
          { framework: "nist_ai_rmf", articleRef: "MEASURE 2.6" },
        ],
      },
      {
        id: "q31",
        text: "Is there a documented AI-specific incident response process?",
        answers: [
          { score: 0, label: "No incident response process for AI-related issues", evidence: "No incident response process exists for AI-related incidents. AI failures, harmful outputs, or data breaches involving this system would be handled without defined procedures." },
          { score: 1, label: "General IT incident process is applied with no AI-specific adaptations", evidence: "General IT incident management processes are applied to AI incidents without AI-specific adaptations. The process does not address AI-specific scenarios such as model failures, biased outputs, or adversarial attacks." },
          { score: 2, label: "AI-specific incident procedure documented but not yet tested", evidence: "An AI-specific incident response procedure has been documented covering AI-specific failure scenarios. The procedure has not been tested in a tabletop exercise or drill." },
          { score: 3, label: "Tested AI-specific incident procedure with defined roles, escalation paths, and post-incident review", evidence: "A comprehensive AI-specific incident response procedure is in place with defined roles, escalation paths to senior management and regulators, and mandatory post-incident review. The procedure is tested annually." },
        ],
        controls: [
          { framework: "iso_42001", articleRef: "10.1" },
          { framework: "dora", articleRef: "Art. 17" },
          { framework: "nist_ai_rmf", articleRef: "MANAGE 4.1" },
        ],
      },
      {
        id: "q32",
        text: "Are AI incidents and near-misses formally recorded and reviewed?",
        answers: [
          { score: 0, label: "Incidents are not recorded", evidence: "AI incidents and near-misses are not recorded. There is no organisational learning mechanism from AI failures and no audit trail demonstrating how issues have been addressed." },
          { score: 1, label: "Major incidents are recorded informally with no structured review", evidence: "Major AI incidents are informally recorded (e.g. in emails or chat messages) without a structured incident log or formal review process." },
          { score: 2, label: "An incident log is maintained but near-misses are not captured and reviews are irregular", evidence: "An incident log is maintained for confirmed AI incidents. Near-misses are not systematically captured and post-incident reviews occur irregularly without a standardised format." },
          { score: 3, label: "Systematic incident and near-miss log with root cause analysis and documented remediation", evidence: "All AI incidents and near-misses are recorded in a structured incident register. Root cause analysis is conducted for significant incidents and remediation actions are tracked to closure, with findings shared across relevant teams." },
        ],
        controls: [
          { framework: "iso_42001", articleRef: "10.1" },
          { framework: "dora", articleRef: "Art. 17" },
          { framework: "nist_ai_rmf", articleRef: "MANAGE 4.1" },
        ],
      },
      {
        id: "q33",
        text: "In the event of a personal data breach involving this system, what notification capability exists?",
        answers: [
          { score: 0, label: "No breach notification process — a breach may not be detected or reported", evidence: "No breach notification process exists. A personal data breach involving this system may go undetected or unreported, violating GDPR Art. 33 obligations to notify the supervisory authority within 72 hours." },
          { score: 1, label: "Breach detection and notification is ad hoc with no defined timelines", evidence: "Breach detection and supervisory authority notification is handled ad hoc. No defined timelines, responsible owner, or regulatory notification templates exist." },
          { score: 2, label: "A notification process exists and 72-hour timeline is known but has not been rehearsed", evidence: "A breach notification procedure is documented identifying the 72-hour GDPR notification obligation to the supervisory authority. The process has not been rehearsed in a simulation exercise." },
          { score: 3, label: "Automated breach detection, defined 72-hour notification workflow, and tested communication templates", evidence: "Automated breach detection triggers a defined notification workflow meeting the GDPR 72-hour supervisory authority notification requirement. Notification templates are pre-approved, DPO involvement is defined, and the process is tested in an annual drill." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 33" },
          { framework: "dora", articleRef: "Art. 17" },
        ],
      },
    ],
  },

  /* ── Section 9: Governance & Accountability ─────────────── */
  {
    id: "s9",
    title: "Governance & Accountability",
    description: "Organisational structures, policies, and accountability for AI oversight.",
    questions: [
      {
        id: "q34",
        text: "Is there executive or board-level accountability for this AI system?",
        answers: [
          { score: 0, label: "No named executive is accountable for this AI system", evidence: "No executive-level accountability for this AI system has been established. Escalation of AI-related risks to senior leadership follows no defined path." },
          { score: 1, label: "Accountability is shared or unclear at senior leadership level", evidence: "AI accountability is informally distributed among senior leaders without clear demarcation. No single executive is formally responsible for the governance of this system." },
          { score: 2, label: "A named executive is responsible but there is no formal accountability framework", evidence: "A named executive is identified as responsible for this AI system. A formal accountability framework, reporting structure, and governance mandate have not been established." },
          { score: 3, label: "Named executive with documented accountability, board reporting, and defined escalation procedures", evidence: "A named executive accountable for this AI system is documented in the organisation's governance framework. Regular board or risk committee reporting on AI system performance and risks is conducted with defined escalation procedures." },
        ],
        controls: [
          { framework: "iso_42001", articleRef: "5.2" },
          { framework: "nist_ai_rmf", articleRef: "GOVERN 2.2" },
          { framework: "eu_ai_act", articleRef: "Art. 17" },
        ],
      },
      {
        id: "q35",
        text: "Does the organisation have a Records of Processing Activities (RoPA) that includes this AI system?",
        answers: [
          { score: 0, label: "No RoPA exists", evidence: "No Records of Processing Activities (RoPA) exists. GDPR Art. 30 requires controllers with more than 250 employees, or those processing high-risk data, to maintain a RoPA. This is a fundamental compliance gap." },
          { score: 1, label: "A RoPA exists but this AI system is not included", evidence: "A RoPA exists for the organisation but this AI system's processing activities have not been added. The RoPA is incomplete and does not accurately represent the organisation's AI processing." },
          { score: 2, label: "This system is recorded in the RoPA but some data flows or purposes are missing", evidence: "This AI system is recorded in the organisation's RoPA, including primary processing purposes and data categories. Some secondary data flows, derived outputs, or retention periods are incomplete." },
          { score: 3, label: "Full RoPA entry with all data flows, purposes, retention periods, and third-party transfers documented", evidence: "A comprehensive RoPA entry for this AI system documents all processing purposes, data categories, data subjects, recipients, international transfers, and retention periods in accordance with GDPR Art. 30." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 30" },
        ],
      },
      {
        id: "q36",
        text: "Is the organisation subject to AI regulations, and has it completed a conformity or compliance assessment?",
        answers: [
          { score: 0, label: "Regulatory applicability has not been assessed", evidence: "The regulatory obligations applicable to this AI system (EU AI Act, DORA, sector-specific regulation) have not been formally assessed. Regulatory risk is unquantified." },
          { score: 1, label: "Applicable regulations have been identified but a compliance gap assessment has not been conducted", evidence: "Applicable regulations have been identified through a preliminary review. A formal compliance gap assessment against specific regulatory requirements has not been conducted." },
          { score: 2, label: "A compliance gap assessment has been completed with remediation actions planned but not complete", evidence: "A compliance gap assessment against applicable AI regulations has been completed. Remediation actions have been identified and are in progress, though not all gaps have been closed." },
          { score: 3, label: "Compliance assessment complete with closed gaps, documented conformity, and ongoing compliance monitoring", evidence: "A comprehensive compliance assessment against all applicable AI regulations has been completed. Identified gaps have been remediated, conformity is documented, and a continuous compliance monitoring process is in place." },
        ],
        controls: [
          { framework: "eu_ai_act", articleRef: "Art. 72" },
          { framework: "iso_42001", articleRef: "9.1" },
          { framework: "nist_ai_rmf", articleRef: "GOVERN 1.1" },
        ],
      },
      {
        id: "q37",
        text: "How does this system handle automated decisions that may significantly affect individuals?",
        hint: "GDPR Art. 22 applies when AI makes solely automated decisions producing legal or similarly significant effects.",
        answers: [
          { score: 0, label: "Solely automated decisions are made without consent, exemption, or human review", evidence: "This system makes solely automated decisions producing legal or similarly significant effects on individuals without consent, a contractual necessity exemption, or meaningful human review. This is a violation of GDPR Art. 22." },
          { score: 1, label: "Human review nominally exists but is rarely exercised in practice", evidence: "A nominal human review step exists in the decision process but is rarely exercised. In practice, the system operates as a solely automated decision-maker for most decisions, which may not satisfy GDPR Art. 22 requirements." },
          { score: 2, label: "A lawful exemption is identified and human review is available on request", evidence: "A valid GDPR Art. 22 exemption (consent, contractual necessity, or legal authorisation) applies to this system's automated decisions. Individuals can request human review of decisions affecting them." },
          { score: 3, label: "Documented Art. 22 compliance: lawful basis, individual rights, meaningful human review process, and audit trail", evidence: "GDPR Art. 22 compliance is formally documented: a valid lawful basis applies to automated decision-making, individuals are informed of their rights, a meaningful human review process is in place and exercised, and an audit trail is maintained for all significant automated decisions." },
        ],
        controls: [
          { framework: "gdpr", articleRef: "Art. 22" },
          { framework: "eu_ai_act", articleRef: "Art. 14" },
        ],
      },
      {
        id: "q38",
        text: "Is there a continuous improvement process for AI governance and compliance?",
        answers: [
          { score: 0, label: "No improvement process — governance practices are static", evidence: "No continuous improvement process exists for AI governance. Governance practices are static and are not reviewed in response to new regulations, incidents, or audit findings." },
          { score: 1, label: "Improvements are made reactively following incidents or external audit findings only", evidence: "AI governance improvements are made reactively following incidents or external audit findings. There is no proactive process for identifying improvement opportunities." },
          { score: 2, label: "Periodic governance reviews are conducted with some follow-through on recommendations", evidence: "Periodic AI governance reviews are conducted (at least annually) with recommendations documented. Follow-through on recommendations is inconsistent." },
          { score: 3, label: "Structured continuous improvement cycle with tracked actions, regular internal audit, and regulatory horizon scanning", evidence: "A structured continuous improvement cycle is embedded in the AI governance programme. Actions are tracked to closure, internal audits are conducted regularly, and a regulatory horizon scanning process monitors emerging obligations." },
        ],
        controls: [
          { framework: "iso_42001", articleRef: "10.1" },
          { framework: "nist_ai_rmf", articleRef: "MANAGE 4.1" },
          { framework: "eu_ai_act", articleRef: "Art. 17" },
        ],
      },
    ],
  },
];

/* ── all questions flat ──────────────────────────────────────── */
export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap(s => s.questions);

/* ── scoring ─────────────────────────────────────────────────── */
export type Answers = Record<string, 0 | 1 | 2 | 3>; // questionId → score

export function scoreFramework(fw: string, answers: Answers): number | null {
  const qids = FW_QUESTION_MAP[fw] ?? [];
  const answered = qids.filter(id => answers[id] !== undefined);
  if (answered.length === 0) return null;
  const total = answered.reduce((s, id) => s + answers[id], 0);
  return total / (answered.length * 3); // 0–1
}

export function scoreAll(answers: Answers): Record<string, number | null> {
  return Object.fromEntries(
    Object.keys(FW_QUESTION_MAP).map(fw => [fw, scoreFramework(fw, answers)])
  );
}

export function advisoryRiskTier(answers: Answers): "unacceptable" | "high" | "limited" | "minimal" {
  const scores = Object.values(scoreAll(answers)).filter(v => v !== null) as number[];
  if (scores.length === 0) return "high";
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  if (avg >= 0.8) return "minimal";
  if (avg >= 0.6) return "limited";
  if (avg >= 0.4) return "high";
  return "unacceptable";
}

/* ── evidence generation for a control ──────────────────────── */
export function evidenceForControl(
  framework: string,
  articleRef: string,
  answers: Answers
): string {
  const relevant = ALL_QUESTIONS.filter(q =>
    q.controls.some(c => c.framework === framework && c.articleRef === articleRef)
  );
  if (relevant.length === 0) return "";
  const parts = relevant
    .filter(q => answers[q.id] !== undefined)
    .map(q => q.answers[answers[q.id]].evidence);
  return parts.join("\n\n");
}

/* ── proposed findings from low-scoring answers ─────────────── */
export interface ProposedFinding {
  id: string;
  questionId: string;
  questionText: string;
  answerLabel: string;
  severity: "critical" | "high" | "medium";
  description: string;
  controls: Array<{ framework: string; articleRef: string }>;
}

export function proposedFindings(answers: Answers): ProposedFinding[] {
  const findings: ProposedFinding[] = [];
  for (const q of ALL_QUESTIONS) {
    const score = answers[q.id];
    if (score === undefined || score >= 2) continue;
    const severity: "critical" | "high" | "medium" = score === 0 ? "critical" : "high";
    findings.push({
      id: `pf-${q.id}`,
      questionId: q.id,
      questionText: q.text,
      answerLabel: q.answers[score].label,
      severity,
      description: `${q.text} — Current state: "${q.answers[score].label}". This represents a ${severity} gap requiring remediation.`,
      controls: q.controls,
    });
  }
  return findings;
}
