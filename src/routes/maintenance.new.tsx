import { createFileRoute } from "@tanstack/react-router";
import { CreateMaintenancePage } from "@/components/echo/maintenance";
export const Route = createFileRoute("/maintenance/new")({
  head: () => ({ meta: [{ title: "Create Maintenance — ECHO" }] }),
  component: CreateMaintenancePage,
});
