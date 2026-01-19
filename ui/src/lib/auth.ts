// Auth utilities for handling JWT tokens and authenticated requests

// Check if we're in a browser environment
export function isBrowser(): boolean {
	return typeof window !== "undefined";
}

export function getToken(): string | null {
	if (!isBrowser()) return null;
	return localStorage.getItem("jwt");
}

export function setToken(token: string): void {
	if (!isBrowser()) return;
	localStorage.setItem("jwt", token);
}

export function removeToken(): void {
	if (!isBrowser()) return;
	localStorage.removeItem("jwt");
}

export function isAuthenticated(): boolean {
	return getToken() !== null;
}

// Authenticated fetch wrapper that automatically includes JWT token
export async function authFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const token = getToken();

	const headers = new Headers(init?.headers || {});
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(input, {
		...init,
		headers,
	});

	// If we get a 401, the token might be expired
	if (response.status === 401) {
		removeToken();
		// Optionally redirect to login
		// window.location.href = '/login';
	}

	return response;
}

// Logout function
export function logout(): void {
	removeToken();
	if (isBrowser()) {
		window.location.href = "/login";
	}
}
