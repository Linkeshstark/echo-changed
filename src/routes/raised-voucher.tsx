import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/raised-voucher")({
  component: () => <Outlet />,
});
