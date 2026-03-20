"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens =
        mode === "login"
          ? await api.auth.login(email, password)
          : await api.auth.register(email, password, fullName);
      setToken(tokens.access_token);
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Logo + brand */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/compass-logo-dark.jpg"
              alt="Compass"
              width={80}
              height={80}
              className="w-20 h-20 object-contain mix-blend-screen"
              priority
            />
            <h1 className="mt-3 text-xl font-semibold text-zinc-50 font-mono tracking-tight">
              Compass
            </h1>
            <p className="text-sm text-zinc-500 mt-1">AI Governance & Compliance</p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 mb-4">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "login"
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "register"
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Create account
            </button>
          </div>

          {/* Form card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-zinc-400 text-sm">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                    className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-400 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-zinc-400 text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-sm transition-colors mt-2"
              >
                {loading
                  ? mode === "login" ? "Signing in…" : "Creating account…"
                  : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-zinc-600 mt-6">
            Open source · MIT License ·{" "}
            <a
              href="https://github.com/bogdanticu88/Compass"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors underline underline-offset-4"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
