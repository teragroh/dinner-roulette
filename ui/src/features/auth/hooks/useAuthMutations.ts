import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setToken } from "@/lib/auth";
import {
	loginUser,
	registerUser,
	type LoginCredentials,
	type RegisterData,
} from "../services/authApi";

export function useAuthMutations() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const loginMutation = useMutation({
		mutationFn: loginUser,
		onSuccess: (token) => {
			setToken(token);
			// Clear all cached queries since user auth state changed
			queryClient.clear();
			navigate({ to: "/" });
		},
		onError: (error) => {
			console.error("Login error:", error.message);
		},
	});

	const registerMutation = useMutation({
		mutationFn: registerUser,
		onSuccess: () => {
			// Clear any cached data since user just registered
			queryClient.clear();
			navigate({ to: "/login" });
		},
		onError: (error) => {
			console.error("Registration error:", error.message);
		},
	});

	return {
		loginMutation,
		registerMutation,
		login: (credentials: LoginCredentials) => loginMutation.mutate(credentials),
		register: (userData: RegisterData) => registerMutation.mutate(userData),
	};
}