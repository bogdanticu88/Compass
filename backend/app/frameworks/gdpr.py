from app.frameworks.base import ControlDef, FrameworkPack

GDPR = FrameworkPack(
    name="GDPR",
    slug="gdpr",
    version="2018",
    controls=[
        ControlDef(
            article_ref="Art. 5",
            title="Principles of Data Processing",
            requirement="Personal data shall be processed lawfully, fairly and transparently; collected for specified, explicit and legitimate purposes; adequate, relevant and limited to what is necessary; accurate; kept no longer than necessary; and processed with appropriate security.",
            evidence_types=["data_processing_policy", "privacy_impact_assessment"],
        ),
        ControlDef(
            article_ref="Art. 6",
            title="Lawful Basis for Processing",
            requirement="Processing shall be lawful only if and to the extent that at least one lawful basis applies: consent, contract, legal obligation, vital interests, public task, or legitimate interests.",
            evidence_types=["lawful_basis_documentation", "consent_records"],
        ),
        ControlDef(
            article_ref="Art. 13",
            title="Transparency and Privacy Notice",
            requirement="Where personal data are collected from the data subject, the controller shall provide information on the processing purposes, legal basis, retention periods, and data subject rights at the time of collection.",
            evidence_types=["privacy_notice", "ai_disclosure_statement"],
        ),
        ControlDef(
            article_ref="Art. 17",
            title="Right to Erasure",
            requirement="The data subject shall have the right to obtain from the controller the erasure of personal data concerning him or her without undue delay, and the controller shall have the obligation to erase personal data without undue delay where applicable.",
            evidence_types=["erasure_procedure", "deletion_confirmation_records"],
        ),
        ControlDef(
            article_ref="Art. 20",
            title="Right to Data Portability",
            requirement="The data subject shall have the right to receive personal data in a structured, commonly used and machine-readable format and to transmit those data to another controller.",
            evidence_types=["portability_procedure", "data_export_capability_doc"],
        ),
        ControlDef(
            article_ref="Art. 22",
            title="Automated Decision-Making and Profiling",
            requirement="The data subject shall have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning him or her or similarly significantly affects them.",
            evidence_types=["automated_decision_policy", "human_review_procedure"],
        ),
        ControlDef(
            article_ref="Art. 25",
            title="Data Protection by Design and Default",
            requirement="The controller shall implement appropriate technical and organisational measures for ensuring that, by default, only personal data which are necessary for each specific purpose of the processing are processed.",
            evidence_types=["privacy_by_design_doc", "data_minimisation_evidence"],
        ),
        ControlDef(
            article_ref="Art. 30",
            title="Records of Processing Activities",
            requirement="Each controller shall maintain a record of processing activities under its responsibility, containing the name and contact details of the controller, purposes of processing, categories of data subjects and personal data, and retention periods.",
            evidence_types=["ropa_document", "processing_register"],
        ),
        ControlDef(
            article_ref="Art. 32",
            title="Security of Processing",
            requirement="The controller and processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including pseudonymisation, encryption, and ongoing confidentiality, integrity, and availability of systems.",
            evidence_types=["security_policy", "encryption_evidence", "access_control_doc"],
        ),
        ControlDef(
            article_ref="Art. 33",
            title="Breach Notification",
            requirement="In the case of a personal data breach, the controller shall notify the supervisory authority without undue delay and, where feasible, not later than 72 hours after having become aware of it.",
            evidence_types=["breach_notification_procedure", "incident_response_plan"],
        ),
        ControlDef(
            article_ref="Art. 35",
            title="Data Protection Impact Assessment",
            requirement="Where a type of processing is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall carry out a data protection impact assessment prior to the processing.",
            evidence_types=["dpia_report", "risk_assessment_gdpr"],
        ),
    ],
)
