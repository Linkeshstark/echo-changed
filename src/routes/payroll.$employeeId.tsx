import { createFileRoute } from "@tanstack/react-router";
import { SalaryDetailsPage } from "@/components/echo/payroll";
export const Route = createFileRoute("/payroll/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Salary ${params.employeeId} — ECHO` }] }),
  component: Page,
});
function Page() {
  const { employeeId } = Route.useParams();
  return <SalaryDetailsPage employeeId={employeeId} />;
}
