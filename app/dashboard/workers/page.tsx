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
  listWorkers,
  type WorkerListItem,
  workerRoleOptions,
  workerStatusOptions,
} from "@/lib/workers";

export const dynamic = "force-dynamic";

type WorkersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkersPage({ searchParams }: WorkersPageProps) {
  const params = searchParams ? await searchParams : {};
  let workers: WorkerListItem[] = [];
  let workersLoadError = false;

  try {
    workers = await listWorkers();
  } catch (error) {
    workersLoadError = true;
    console.error("Failed to load workers:", error);
  }

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Workers</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Worker management
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Add workers to the shared roster, store them in Supabase, and review the
            saved list from the dashboard.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <UserPlus className="size-4" />
          Phase 5 live worker module
        </div>
      </div>

      <div className="space-y-3">
        {statusMessage ? (
          <div
            className={`flex items-start gap-3 rounded-3xl border px-4 py-4 text-sm shadow-sm ${
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

        {workersLoadError ? (
          <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-950 shadow-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Workers could not be loaded from Supabase right now. The form remains
              available, but the database connection needs to be restored before the
              roster can refresh.
            </p>
          </div>
        ) : null}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {workerCards.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="border-white/70 bg-white/80">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="pt-2 text-3xl">{value}</CardTitle>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Icon className="size-5" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Add worker</CardTitle>
            <CardDescription>
              Save a new worker directly to Supabase and refresh the roster on submit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createWorkerAction} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">First name</span>
                  <input
                    required
                    name="firstName"
                    autoComplete="given-name"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="Olivia"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Last name</span>
                  <input
                    required
                    name="lastName"
                    autoComplete="family-name"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="worker@ndisready.com"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Phone</span>
                <input
                  name="phone"
                  autoComplete="tel"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="0400 000 000"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Role</span>
                  <select
                    name="role"
                    defaultValue={workerRoleOptions[0].value}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <UserPlus className="size-4" />
                Save worker
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>Saved workers</CardTitle>
            <CardDescription>
              Workers are listed from Supabase in reverse creation order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workersLoadError ? (
              <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 px-6 py-12 text-center text-sm text-rose-900">
                Supabase data could not be loaded for the worker roster.
              </div>
            ) : workers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                No workers saved yet. Submit the form to create the first worker.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200">
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
                      className="grid gap-4 px-4 py-4 text-sm text-slate-700 md:grid-cols-[1.2fr_0.8fr_0.7fr_1fr_0.9fr] md:items-center"
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
                          <span className="truncate">{worker.email}</span>
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
      </section>
    </div>
  );
}

function getStatusMessage(params: Record<string, string | string[] | undefined>) {
  if (params.created === "1") {
    return {
      tone: "success" as const,
      message: "Worker added and saved to Supabase. The roster has been refreshed.",
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
      message: "The worker could not be saved to Supabase. Check the server configuration and try again.",
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
