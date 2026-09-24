import { createFileRoute } from "@tanstack/react-router";
import { EmployeeVoucherDetailPage } from "@/components/echo/vouchers";
export const Route = createFileRoute("/monitor/$employeeId/vouchers/$voucherCode")({
  head: ({ params }) => ({ meta: [{ title: `${params.voucherCode} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { employeeId, voucherCode } = Route.useParams();
  return <EmployeeVoucherDetailPage employeeId={employeeId} voucherCode={voucherCode} />;
}
