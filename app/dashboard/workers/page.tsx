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

      <section className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(260px,0.72fr)_minmax(340px,0.9fr)_minmax(0,1.38fr)] xl:gap-5 2xl:grid-cols-[minmax(280px,0.78fr)_minmax(360px,0.94fr)_minmax(0,1.42fr)]">
        <WorkerAnalyticsPanel
          workers={workers}
          className="order-2 self-start lg:order-1 xl:sticky xl:top-4"
        />

        <Card className="dashboard-surface order-1 min-w-0 self-start lg:order-2">
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
                className="inline-flex h-11 w-full self-start items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
              >
                <UserPlus className="size-4" />
                Save worker
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="dashboard-surface order-3 min-w-0 lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Saved workers</CardTitle>
            <CardDescription>
              Workers are listed with the most recently added records first.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            {workers.length === 0 ? (
              <div className="dashboard-empty-state">
                No workers saved yet. Submit the form to create the first worker.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
                  <div className="divide-y divide-slate-200">
                    {workers.map((worker) => {
                      const fullName = `${worker.firstName} ${worker.lastName}`;
                      const roleLabel = formatWorkerRole(worker.role);
                      const statusLabel = formatWorkerStatus(worker.status);

                      return (
                        <article
                          key={worker.id}
                          className="px-5 py-5 xl:px-6"
                        >
                          <div className="flex min-w-0 flex-wrap items-start gap-x-5 gap-y-3 xl:gap-x-6">
                            <div className="min-w-0 flex-1 basis-[16rem]">
                              <div
                                className="text-base font-semibold leading-6 text-slate-950"
                                title={fullName}
                              >
                                {fullName}
                              </div>
                              <div className="pt-1.5 text-sm text-slate-500">
                                Added {formatWorkerDate(worker.createdAt)}
                              </div>
                            </div>

                            <div
                              className="shrink-0 whitespace-nowrap pt-0.5 text-sm font-medium leading-6 text-slate-700"
                              title={roleLabel}
                            >
                              {roleLabel}
                            </div>

                            <div className="flex shrink-0">
                              <Badge
                                variant="secondary"
                                className={`${getStatusBadgeClassName(worker.status)} !w-fit !whitespace-nowrap !break-normal`}
                              >
                                {statusLabel}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-4 flex min-w-0 flex-wrap items-start gap-x-8 gap-y-3 border-t border-slate-100 pt-4">
                            <div className="flex min-w-0 flex-1 basis-[20rem] items-start gap-2.5 text-sm leading-6 text-slate-600">
                              <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
                              <span
                                className="min-w-0 break-words text-slate-700"
                                title={worker.email}
                              >
                                {worker.email}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-start gap-2.5 text-sm leading-6 text-slate-600">
                              <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                              <span className="whitespace-nowrap text-slate-700">
                                {worker.phone ?? "Not provided"}
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 md:hidden">
                  {workers.map((worker) => (
                    <div
                      key={worker.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium text-slate-950">
                            {worker.firstName} {worker.lastName}
                          </div>
                          <div className="pt-1 text-xs text-slate-500">
                            Added {formatWorkerDate(worker.createdAt)}
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm text-slate-600">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Role
                            </div>
                            <div className="whitespace-nowrap text-base text-slate-700">
                              {formatWorkerRole(worker.role)}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Status
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${getStatusBadgeClassName(worker.status)} !whitespace-nowrap !break-normal`}
                            >
                              {formatWorkerStatus(worker.status)}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Email
                            </div>
                            <div className="flex min-w-0 items-center gap-2 text-base text-slate-700">
                              <Mail className="size-4 shrink-0 text-slate-400" />
                              <span className="min-w-0 break-words">{worker.email}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Phone
                            </div>
                            <div className="flex min-w-0 items-start gap-2 text-base text-slate-700">
                              <Phone className="size-4 shrink-0 text-slate-400" />
                              <span className="break-words">
                                {worker.phone ?? "Not provided"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
