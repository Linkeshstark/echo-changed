import { createFileRoute } from "@tanstack/react-router";
import { RaisedVoucherPage } from "@/components/echo/vouchers";
export const Route = createFileRoute("/raised-voucher/")({
  head: () => ({
    meta: [
      { title: "Raised Voucher — ECHO" },
      { name: "description", content: "Review employee vouchers raised to the admin desk." },
      { property: "og:title", content: "Raised Voucher — ECHO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RaisedVoucherPage,
});
