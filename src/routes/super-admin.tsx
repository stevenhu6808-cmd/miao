import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "./admin";

export const Route = createFileRoute("/super-admin")({
  head: () => ({ meta: [{ title: "超级管理员控制台 | Raid Nexus" }] }),
  component: AdminPage,
});
