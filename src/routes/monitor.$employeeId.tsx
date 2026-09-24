import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/monitor/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Monitor ${params.employeeId} — ECHO` }] }),
  component: () => <Outlet />,
});
