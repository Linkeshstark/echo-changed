import { createFileRoute } from "@tanstack/react-router";
import { DonationPage } from "@/components/echo/donations";
export const Route = createFileRoute("/donation/")({
  head: () => ({
    meta: [
      { title: "Donation — ECHO" },
      { name: "description", content: "Donation records, receipts and approvals." },
      { property: "og:title", content: "Donation — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DonationPage,
});
