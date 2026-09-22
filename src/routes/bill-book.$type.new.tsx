import { createFileRoute } from "@tanstack/react-router";
import { GenerateDocPage, docTypeOfRoute } from "@/components/echo/bill-generate";
import { docTypeMeta } from "@/lib/echo-ops-data";

export const Route = createFileRoute("/bill-book/$type/new")({
  head: () => ({ meta: [{ title: "Generate Document — ECHO" }] }),
  component: Page,
});

function Page() {
  const { type } = Route.useParams();
  const docType = docTypeOfRoute(type);
  return <GenerateDocPage type={docType} label={docTypeMeta[docType].label} />;
}
