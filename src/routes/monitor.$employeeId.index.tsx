import { createFileRoute } from "@tanstack/react-router";
import { MonitorEmployeePage } from "@/components/echo/monitor";
export const Route = createFileRoute("/monitor/$employeeId/")({
  head: ({ params }) => ({ meta: [{ title: `Monitor ${params.employeeId} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { employeeId } = Route.useParams();
  const { tab, task } = Route.useSearch();
  return <MonitorEmployeePage employeeId={employeeId} tab={tab} task={task} />;
}
