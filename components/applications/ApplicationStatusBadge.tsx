import type { ApplicationStatus } from "@/lib/applications/types";
import { applicationStatusLabels } from "@/lib/applications/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<ApplicationStatus, string> = {
  accepted: "bg-emerald-100 text-emerald-900 border-emerald-200",
  documents_ready: "bg-amber-100 text-amber-950 border-amber-200",
  interview: "bg-amber-100 text-amber-950 border-amber-200",
  not_started: "bg-muted text-foreground border-border",
  preparing: "bg-secondary text-secondary-foreground border-secondary",
  rejected: "bg-red-100 text-red-900 border-red-200",
  submitted: "bg-primary text-primary-foreground border-primary",
  waitlisted: "bg-amber-100 text-amber-950 border-amber-200",
  withdrawn: "bg-muted text-foreground border-border",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn("rounded-md border px-3 py-1 text-sm font-semibold", statusStyles[status])}>
      {applicationStatusLabels[status]}
    </span>
  );
}
