import { Link } from "@tanstack/react-router";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { isAuthenticated, logout } from "@/lib/auth";

export function Header() {
	const isAuth = isAuthenticated();

	return (
		<header className="border-b">
			<div className="container mx-auto flex items-center justify-between px-4 py-3">
				{/* Logo/Brand */}
				<Link to="/" className="flex items-center space-x-2">
					<h1 className="text-2xl font-bold">🍽️ Dinner Roulette</h1>
				</Link>

				{/* Right side actions */}
				<div className="flex items-center space-x-2">
					{isAuth ? (
						<Button variant="outline" size="sm" onClick={logout}>
							Sign Out
						</Button>
					) : (
						<>
							<Button variant="outline" size="sm" asChild>
								<Link to="/login">Sign In</Link>
							</Button>
						</>
					)}
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
