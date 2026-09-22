import { createFileRoute } from "@tanstack/react-router";
import { ClientPortalPage } from "@/components/echo/raised-activity";
export const Route = createFileRoute("/clients/$clientName")({
  head: ({ params }) => ({ meta: [{ title: `${params.clientName} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { clientName } = Route.useParams();
  return <ClientPortalPage clientName={clientName} />;
}
