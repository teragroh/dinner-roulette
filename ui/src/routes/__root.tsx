import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { Header } from "@/components/Header";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
	notFoundComponent: () => <div>404 - Page Not Found</div>,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
						(function() {
							try {
								var storageKey = 'vite-ui-theme';
								var theme = localStorage.getItem(storageKey);
								var root = document.documentElement;
								
								// Remove any existing theme classes
								root.classList.remove('light', 'dark');
								
								if (!theme || theme === 'system') {
									// Use system preference
									var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
									root.classList.add(systemTheme);
								} else {
									// Use stored theme
									root.classList.add(theme);
								}
							} catch (e) {
								// Fallback to dark theme
								document.documentElement.classList.add('dark');
							}
						})();
						`,
					}}
				/>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<Header />
					<main>{children}</main>
				</ThemeProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
