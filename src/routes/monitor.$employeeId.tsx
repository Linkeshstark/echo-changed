import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/monitor/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Monitor ${params.employeeId} — ECHO` }] }),
  // Search values arrive as JSON when they look numeric (?task=22), so coerce to text.
  validateSearch: (search: Record<string, unknown>) => {
    const text = (v: unknown) =>
      typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;
    return { tab: text(search["tab"]), task: text(search["task"]) };
  },
  component: () => <Outlet />,
});
