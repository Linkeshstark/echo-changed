import { createFileRoute } from "@tanstack/react-router";
import { EmployeeSubmissionTimelinePage } from "@/components/echo/task-submissions";
export const Route = createFileRoute("/submissions/$employeeId/")({
  component: Page,
});
function Page() {
  const { employeeId } = Route.useParams();
  return <EmployeeSubmissionTimelinePage employeeId={employeeId} />;
}
