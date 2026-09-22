import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/submissions/$employeeId")({
  head: () => ({ meta: [{ title: "Submission Timeline — ECHO" }] }),
  component: () => <Outlet />,
});
