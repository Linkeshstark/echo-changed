import { createFileRoute } from "@tanstack/react-router";
import { RaisedVoucherDetailPage } from "@/components/echo/vouchers";
export const Route = createFileRoute("/raised-voucher/$voucherCode")({
  head: ({ params }) => ({ meta: [{ title: `${params.voucherCode} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { voucherCode } = Route.useParams();
  return <RaisedVoucherDetailPage voucherCode={voucherCode} />;
}
