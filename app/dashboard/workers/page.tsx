import type { Metadata } from "next";
import {
  CheckCircle2,
  CircleAlert,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { createWorkerAction } from "@/app/dashboard/workers/actions";
import { WorkerAnalyticsPanel } from "@/components/dashboard/module-analytics";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatWorkerRole,
  formatWorkerStatus,
  type WorkerListItem,
  workerRoleOptions,
  workerStatusOptions,
} from "@/lib/workers";
import { loadWorkersDirectory } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Workers",
  description: "View and add NDIS support workers in the NDISReady.ai workspace.",
};

type WorkersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkersPage({ searchParams }: WorkersPageProps) {
  const params = searchParams ? await searchParams : {};
  const workersResult = await loadWorkersDirectory();
  const workers = workersResult.data as WorkerListItem[];

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((worker) => worker.status === "active").length;
  const uniqueRoles = new Set(workers.map((worker) => worker.role)).size;

  const workerCards = [
    { title: "Total workers", value: String(totalWorkers), icon: Users },
    { title: "Active workers", value: String(activeWorkers), icon: ShieldCheck },
    { title: "Roles in roster", value: String(uniqueRoles), icon: UserPlus },
  ];

  const statusMessage = getStatusMessage(params);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div className="dashboard-page-heading">
          <Badge className="w-fit">Workers</Badge>
          <h1 className="dashboard-page-title">Worker management</h1>
          <p className="dashboard-page-copy">
            Add workers to the shared roster and review the current team from the dashboard.
          </p>
        </div>

        <div className="dashboard-chip">
          <UserPlus className="size-4" />
          Live roster
        </div>
      </div>

      <div className="space-y-3">
        {statusMessage ? (
          <div
            className={`dashboard-notice ${
              statusMessage.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-rose-200 bg-rose-50 text-rose-950"
            }`}
          >
            {statusMessage.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
            )}
            <p>{statusMessage.message}</p>
          </div>
        ) : null}

        {workersResult.notice ? (
          <div className="dashboard-notice border-amber-200 bg-amber-50 text-amber-950">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{workersResult.notice.title}</p>
              <p>{workersResult.notice.message}</p>
            </div>
          </div>
        ) : null}
      </div>

      <section className="dashboard-summary-grid">
        {workerCards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="dashboard-stat-surface">
            <CardHeader className="flex flex-col gap-3 space-y-0 p-3.5 md:flex-row md:items-start md:justify-between md:p-4">
              <div>
                <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</CardDescription>
                <CardTitle className="pt-1.5 text-[1.6rem] leading-none">{value}</CardTitle>
              </div>
              <div className="rounded-[10px] bg-slate-100 p-2.5 text-slate-700">
                <Icon className="size-4.5" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <WorkerAnalyticsPanel
          workers={workers}
          className="order-2 self-start xl:order-1 xl:sticky xl:top-3"
        />

        <div className="order-1 min-w-0 space-y-3 xl:order-2 2xl:grid 2xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] 2xl:items-start 2xl:gap-3 2xl:space-y-0">
          <Card className="dashboard-surface">
            <CardHeader>
              <CardTitle>Add worker</CardTitle>
              <CardDescription>
                Add a worker to the roster and keep the team list up to date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createWorkerAction} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">First name</span>
                    <input
                      required
                      name="firstName"
                      autoComplete="given-name"
                      className="field-control"
                      placeholder="Olivia"
                    />
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Last name</span>
                    <input
                      required
                      name="lastName"
                      autoComplete="family-name"
                      className="field-control"
                      placeholder="Martin"
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="field-control"
                    placeholder="worker@ndisready.com"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Phone</span>
                  <input
                    name="phone"
                    autoComplete="tel"
                    className="field-control"
                    placeholder="0400 000 000"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Role</span>
                    <select
                      name="role"
                      defaultValue={workerRoleOptions[0].value}
                      className="field-control"
                    >
                      {workerRoleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Status</span>
                    <select
                      name="status"
                      defaultValue={workerStatusOptions[0].value}
                      className="field-control"
                    >
                      {workerStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 md:w-auto"
                >
                  <UserPlus className="size-4" />
                  Save worker
                </button>
              </form>
            </CardContent>
          </Card>

          <Card className="dashboard-surface min-w-0">
            <CardHeader>
              <CardTitle>Saved workers</CardTitle>
              <CardDescription>
                Workers are listed with the most recently added records first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workers.length === 0 ? (
                <div className="dashboard-empty-state">
                  No workers saved yet. Submit the form to create the first worker.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_1fr_0.9fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid">
                    <span>Name</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span>Email</span>
                    <span>Phone</span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {workers.map((worker) => (
                      <div
                        key={worker.id}
                        className="grid gap-4 px-4 py-4 text-base text-slate-700 md:grid-cols-[1.2fr_0.8fr_0.7fr_1fr_0.9fr] md:items-center"
                      >
                        <div>
                          <p className="font-medium text-slate-950">
                            {worker.firstName} {worker.lastName}
                          </p>
                          <p className="pt-1 text-xs text-slate-500">
                            Added {formatWorkerDate(worker.createdAt)}
                          </p>
                        </div>

                        <div className="md:text-slate-700">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
                            Role
                          </span>
                          <p className="pt-1 md:pt-0">{formatWorkerRole(worker.role)}</p>
                        </div>

                        <div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
                            Status
                          </span>
                          <div className="pt-2 md:pt-0">
                            <Badge
                              variant="secondary"
                              className={getStatusBadgeClassName(worker.status)}
                            >
                              {formatWorkerStatus(worker.status)}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
                            Email
                          </span>
                          <div className="flex items-center gap-2 pt-1 md:pt-0">
                            <Mail className="size-4 text-slate-400" />
                            <span className="break-all md:truncate">{worker.email}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
                            Phone
                          </span>
                          <div className="flex items-center gap-2 pt-1 md:pt-0">
                            <Phone className="size-4 text-slate-400" />
                            <span>{worker.phone ?? "Not provided"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function getStatusMessage(params: Record<string, string | string[] | undefined>) {
  if (params.created === "1") {
    return {
      tone: "success" as const,
      message: "Worker added successfully. The roster has been refreshed.",
    };
  }

  if (params.error === "duplicate") {
    return {
      tone: "error" as const,
      message: "A worker with that email already exists in this workspace.",
    };
  }

  if (params.error === "invalid") {
    return {
      tone: "error" as const,
      message: "Enter a first name, last name, valid email, role, and status before saving.",
    };
  }

  if (params.error === "save") {
    return {
      tone: "error" as const,
      message: "The worker could not be saved right now. Please try again.",
    };
  }

  return null;
}

function formatWorkerDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusBadgeClassName(status: string) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "onboarding") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}
