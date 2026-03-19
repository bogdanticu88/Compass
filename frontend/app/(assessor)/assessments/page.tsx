"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Assessment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  in_review: "default",
  complete: "outline",
};

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    api.assessments
      .list()
      .then(setAssessments)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Assessments</h1>
            <p className="text-slate-500 mt-1">Your governance assessments</p>
          </div>
          <Link href="/assessments/new">
            <Button>New Assessment</Button>
          </Link>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No assessments yet.{" "}
              <Link href="/assessments/new" className="text-blue-600 hover:underline">
                Start one.
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => (
              <Link href={`/assessments/${a.id}`} key={a.id}>
                <Card className="hover:border-blue-300 cursor-pointer transition-colors">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        Assessment {a.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {a.frameworks.join(", ")} · Due: {a.due_date ?? "—"}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
