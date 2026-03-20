"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Plug, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { AISystem, ConnectorConfig } from "@/lib/types";

/* ── Connector definitions ──────────────────────────────── */
type FieldDef = { key: string; label: string; placeholder: string; secret?: boolean };

const CONNECTORS: Record<string, { label: string; description: string; fields: FieldDef[] }> = {
  github: {
    label: "GitHub",
    description: "Pulls CI/CD workflow runs, test coverage, PR reviews, and release history.",
    fields: [
      { key: "repo",  label: "Repository",    placeholder: "owner/repository" },
      { key: "token", label: "Personal Access Token", placeholder: "ghp_...", secret: true },
    ],
  },
  azure_devops: {
    label: "Azure DevOps",
    description: "Pulls pipeline build results, release records, and work item history.",
    fields: [
      { key: "organization", label: "Organization",  placeholder: "your-org" },
      { key: "project",      label: "Project",       placeholder: "your-project" },
      { key: "token",        label: "Personal Access Token", placeholder: "PAT token", secret: true },
    ],
  },
  jira: {
    label: "Jira",
    description: "Pulls risk and compliance tickets and incident records.",
    fields: [
      { key: "base_url",    label: "Base URL",     placeholder: "https://yourorg.atlassian.net" },
      { key: "email",       label: "Email",        placeholder: "you@yourorg.com" },
      { key: "api_token",   label: "API Token",    placeholder: "Jira API token", secret: true },
      { key: "project_key", label: "Project Key",  placeholder: "COMP" },
    ],
  },
  servicenow: {
    label: "ServiceNow",
    description: "Pulls change requests, incidents, and risk register entries.",
    fields: [
      { key: "instance_url", label: "Instance URL", placeholder: "https://yourorg.service-now.com" },
      { key: "username",     label: "Username",     placeholder: "admin" },
      { key: "password",     label: "Password",     placeholder: "your-password", secret: true },
    ],
  },
  aws: {
    label: "AWS",
    description: "Pulls CloudTrail audit logs, Config rule compliance, and SageMaker model records.",
    fields: [
      { key: "access_key_id",     label: "Access Key ID",     placeholder: "AKIA..." },
      { key: "secret_access_key", label: "Secret Access Key", placeholder: "your-secret", secret: true },
      { key: "region",            label: "Region",            placeholder: "eu-west-1" },
    ],
  },
  azure: {
    label: "Azure",
    description: "Pulls Activity Log audit events, Policy compliance state, and role assignments.",
    fields: [
      { key: "tenant_id",       label: "Tenant ID",       placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { key: "client_id",       label: "Client ID",       placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { key: "client_secret",   label: "Client Secret",   placeholder: "your-secret", secret: true },
      { key: "subscription_id", label: "Subscription ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
    ],
  },
};

const CONNECTOR_NAMES = Object.keys(CONNECTORS);

export default function ConnectorsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [system, setSystem]       = useState<AISystem | null>(null);
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [loading, setLoading]     = useState(true);

  // add-form state
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState<string>(CONNECTOR_NAMES[0]);
  const [fields, setFields]       = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    Promise.all([api.systems.get(id), api.connectors.list(id)])
      .then(([sys, cfgs]) => { setSystem(sys); setConnectors(cfgs); })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [id, router]);

  function handleSelectConnector(name: string) {
    setSelected(name);
    setFields({});
    setSaveError(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const created = await api.connectors.create(id, {
        connector_name: selected,
        config: fields,
        is_enabled: true,
      });
      setConnectors(prev => [...prev, created]);
      setShowForm(false);
      setFields({});
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save connector");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(connectorName: string) {
    setDeletingId(connectorName);
    try {
      await api.connectors.delete(id, connectorName);
      setConnectors(prev => prev.filter(c => c.connector_name !== connectorName));
    } catch {
      // noop
    } finally {
      setDeletingId(null);
    }
  }

  const def = CONNECTORS[selected];
  const configured = new Set(connectors.map(c => c.connector_name));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* header */}
        <div>
          <Link
            href={`/assessments`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to assessments
          </Link>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Plug className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-100">Evidence Connectors</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {system?.name} — automated evidence collection from your tools
              </p>
            </div>
          </div>
        </div>

        {/* configured connectors */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Configured</h2>

          {connectors.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-8 text-center">
              <p className="text-zinc-500 text-sm">No connectors configured yet.</p>
              <p className="text-zinc-600 text-xs mt-1">Add one below to start pulling evidence automatically.</p>
            </div>
          ) : (
            connectors.map(c => {
              const meta = CONNECTORS[c.connector_name];
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    {c.is_enabled
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{meta?.label ?? c.connector_name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{meta?.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c.connector_name)}
                    disabled={deletingId === c.connector_name}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                    title="Remove connector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* add connector */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl px-5 py-4 w-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add connector
          </button>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-zinc-100">Add connector</h2>

            {/* connector type picker */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CONNECTOR_NAMES.map(name => {
                const isConfigured = configured.has(name);
                const isActive = selected === name;
                return (
                  <button
                    key={name}
                    onClick={() => handleSelectConnector(name)}
                    disabled={isConfigured}
                    className={[
                      "text-xs font-medium rounded-lg px-3 py-2.5 border transition-colors text-center",
                      isActive
                        ? "bg-zinc-700 border-zinc-600 text-zinc-100"
                        : isConfigured
                          ? "bg-zinc-900/40 border-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
                    ].join(" ")}
                  >
                    {CONNECTORS[name].label}
                    {isConfigured && <span className="block text-[10px] text-zinc-600 mt-0.5">configured</span>}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-zinc-500">{def.description}</p>

            {/* dynamic fields */}
            <form onSubmit={handleAdd} className="space-y-4">
              {def.fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">{f.label}</label>
                  <input
                    type={f.secret ? "password" : "text"}
                    value={fields[f.key] ?? ""}
                    onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              ))}

              {saveError && (
                <p className="text-xs text-red-400">{saveError}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-zinc-100 text-zinc-900 text-sm font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save connector"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFields({}); setSaveError(null); }}
                  className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* info note */}
        <p className="text-xs text-zinc-600 leading-relaxed">
          Credentials are stored encrypted and never returned by the API. Connectors run when you
          trigger a recollect on an assessment. Each connector pulls the most recent evidence and
          maps it to the relevant framework controls automatically.
        </p>

      </div>
    </div>
  );
}
