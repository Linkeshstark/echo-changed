import { createFileRoute } from "@tanstack/react-router";
import { RegularTasksPage } from "@/components/echo/regular-tasks";
export const Route = createFileRoute("/monitor/$employeeId/regular-tasks/")({
  head: () => ({
    meta: [
      { title: "Regular Tasks — ECHO" },
      { name: "description", content: "Every scheduled check-in assigned to this employee, with its occurrence log." },
      { property: "og:title", content: "Regular Tasks — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const { employeeId } = Route.useParams();
  return <RegularTasksPage employeeId={employeeId} />;
}
