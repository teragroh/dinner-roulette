import { API_URLS } from "@/config";

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterData {
	username: string;
	email: string;
	password: string;
}

export async function loginUser(
	credentials: LoginCredentials,
): Promise<string> {
	const res = await fetch(`${API_URLS.BASE}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(credentials),
	});

	if (!res.ok) {
		const responseText = await res.text();
		try {
			const errorData = JSON.parse(responseText);
			throw new Error(
				errorData.error || `Login failed with status ${res.status}`,
			);
		} catch (parseError) {
			// If JSON parsing fails, use the raw text response
			throw new Error(
				responseText || `Request failed with status ${res.status}`,
			);
		}
	}

	return await res.text();
}

export async function registerUser(userData: RegisterData): Promise<Response> {
	const res = await fetch(`${API_URLS.BASE}/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userData),
	});

	if (!res.ok) {
		const responseClone = res.clone();
		const responseText = await responseClone.text();
		try {
			const errorData = JSON.parse(responseText);
			throw new Error(
				errorData.error || `Registration failed with status ${res.status}`,
			);
		} catch (parseError) {
			// If this is our clean error being caught, re-throw it
			if (
				parseError instanceof Error &&
				parseError.message &&
				!parseError.message.startsWith("{")
			) {
				throw parseError;
			}

			// If JSON parsing fails, use the raw text response
			throw new Error(
				responseText || `Request failed with status ${res.status}`,
			);
		}
	}

	return res;
}