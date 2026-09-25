import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceRecordPage } from "@/components/echo/maintenance";
export const Route = createFileRoute("/maintenance/$code")({
  head: ({ params }) => ({ meta: [{ title: `Maintenance ${params.code} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { code } = Route.useParams();
  return <MaintenanceRecordPage code={code} />;
}
