import { createFileRoute } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { RecipeBox } from "@/features/recipes";
export const Route = createFileRoute("/")({ component: App });

function App() {
	const navigate = useNavigate();
	if (!isAuthenticated()) {
		navigate({ to: "/login" });
		return null;
	}

	return <RecipeBox />;
}
