import { createFileRoute } from "@tanstack/react-router";
import ClockApp from "@/components/ClockApp";

export const Route = createFileRoute("/")({
  component: ClockApp,
});
