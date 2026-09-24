import { createFileRoute } from "@tanstack/react-router";
import { RegularTaskDetailPage } from "@/components/echo/regular-tasks";
export const Route = createFileRoute("/monitor/$employeeId/regular-tasks/$taskId")({
  head: ({ params }) => ({ meta: [{ title: `${params.taskId} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { employeeId, taskId } = Route.useParams();
  return <RegularTaskDetailPage employeeId={employeeId} taskId={taskId} />;
}
