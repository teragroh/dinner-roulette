import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/features/auth";

export const Route = createFileRoute("/register/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AuthForm mode="register" />;
}
