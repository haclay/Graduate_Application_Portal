import type { ApplicationStatus } from "@/lib/applications/types";
import { applicationStatusLabels } from "@/lib/applications/types";

const statusStyles: Record<ApplicationStatus, string> = {
  accepted: "bg-secondary text-secondary-foreground",
  documents_ready: "bg-accent text-accent-foreground",
  interview: "bg-accent text-accent-foreground",
  not_started: "bg-muted text-muted-foreground",
  preparing: "bg-secondary text-secondary-foreground",
  rejected: "bg-destructive/10 text-destructive",
  submitted: "bg-primary text-primary-foreground",
  waitlisted: "bg-accent text-accent-foreground",
  withdrawn: "bg-muted text-muted-foreground",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`rounded-md px-3 py-1 text-sm font-medium ${statusStyles[status]}`}>
      {applicationStatusLabels[status]}
    </span>
  );
}
