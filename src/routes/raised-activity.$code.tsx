import { createFileRoute } from "@tanstack/react-router";
import { RaisedActivityDetailsPage } from "@/components/echo/raised-activity";
export const Route = createFileRoute("/raised-activity/$code")({
  head: ({ params }) => ({ meta: [{ title: `${params.code} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { code } = Route.useParams();
  return <RaisedActivityDetailsPage code={code} />;
}
