import { createFileRoute } from "@tanstack/react-router";
import { TaskReviewPage } from "@/components/echo/task-submissions";
export const Route = createFileRoute("/submissions/$employeeId/$taskId")({
  head: ({ params }) => ({
    meta: [{ title: `Task #${params.taskId} Review — ECHO` }],
  }),
  component: Page,
});
function Page() {
  const { employeeId, taskId } = Route.useParams();
  return <TaskReviewPage employeeId={employeeId} taskId={taskId} />;
}
