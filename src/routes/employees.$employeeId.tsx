import { createFileRoute } from "@tanstack/react-router";
import { EmployeeProfilePage } from "@/components/echo/data-pages";
export const Route = createFileRoute("/employees/$employeeId")({
  head: ({ params }) => ({
    meta: [
      { title: `Employee ${params.employeeId} — ECHO` },
      { name: "description", content: "View employee profile and advance history." },
      { property: "og:title", content: "Employee Profile — ECHO" },
      { property: "og:description", content: "View employee profile and advance history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const { employeeId } = Route.useParams();
  return <EmployeeProfilePage employeeId={employeeId} />;
}
