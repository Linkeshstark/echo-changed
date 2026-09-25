import { createFileRoute } from "@tanstack/react-router";
import { SalaryDetailsPage } from "@/components/echo/payroll";
export const Route = createFileRoute("/payroll/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Salary ${params.employeeId} — ECHO` }] }),
  // Search values arrive as JSON when they look numeric, so coerce to text.
  validateSearch: (search: Record<string, unknown>) => {
    const text = (v: unknown) =>
      typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;
    return { month: text(search["month"]) };
  },
  component: Page,
});
function Page() {
  const { employeeId } = Route.useParams();
  const { month } = Route.useSearch();
  return <SalaryDetailsPage employeeId={employeeId} month={month} />;
}
