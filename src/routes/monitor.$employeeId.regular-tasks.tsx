import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/monitor/$employeeId/regular-tasks")({
  head: ({ params }) => ({ meta: [{ title: `Regular Tasks — ${params.employeeId} — ECHO` }] }),
  component: () => <Outlet />,
});
