import { createFileRoute } from "@tanstack/react-router";
import { DonationDetailsPage } from "@/components/echo/donations";
export const Route = createFileRoute("/donation/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Donation ${params.code} — ECHO` },
      { name: "description", content: "Donation details, receipt and approval remarks." },
    ],
  }),
  component: Page,
});
function Page() {
  const { code } = Route.useParams();
  return <DonationDetailsPage code={code} />;
}
