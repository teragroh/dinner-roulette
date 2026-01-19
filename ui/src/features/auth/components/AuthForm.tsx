import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useAuthMutations } from "../hooks/useAuthMutations";
import { AuthFormFields } from "./AuthFormFields";

interface AuthFormProps {
	mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
	const isLogin = mode === "login";
	const [passwordError, setPasswordError] = useState<string | null>(null);
	
	const { loginMutation, registerMutation, login, register } = useAuthMutations();
	
	const currentMutation = isLogin ? loginMutation : registerMutation;
	const isLoading = currentMutation.isPending;
	const error = currentMutation.error?.message || passwordError;

	// Clear errors when switching modes or when user starts typing
	const clearErrors = () => {
		setPasswordError(null);
		if (currentMutation.error) {
			currentMutation.reset();
		}
	};

	const form = useForm({
		defaultValues: {
			username: "",
			email: isLogin ? "" : "",
			password: "",
			confirmPassword: isLogin ? "" : "",
		},
		onSubmit: async ({ value }) => {
			// Password confirmation check for register mode
			if (!isLogin && value.password !== value.confirmPassword) {
				setPasswordError("Passwords do not match");
				return;
			}
			
			clearErrors();

			if (isLogin) {
				login({
					username: value.username,
					password: value.password,
				});
			} else {
				register({
					username: value.username,
					email: value.email,
					password: value.password,
				});
			}
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>
						{isLogin ? "Login to your account" : "Create your account"}
					</CardTitle>
					<CardDescription>
						{isLogin
							? "Enter your username and password below to login to your account"
							: "Enter your details below to create your account"}
					</CardDescription>
				</CardHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<CardContent>
						{error && (
							<div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded flex justify-between items-center">
								<span>{error}</span>
								<button
									type="button"
									onClick={clearErrors}
									className="ml-2 text-red-800 hover:text-red-900"
									aria-label="Clear error"
								>
									×
								</button>
							</div>
						)}
						
						<AuthFormFields
							mode={mode}
							form={form}
							onFieldChange={clearErrors}
						/>
					</CardContent>

					<CardFooter className="flex-col gap-2 mt-6">
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Loading..." : isLogin ? "Login" : "Create Account"}
						</Button>
						<div className="text-center">
							<Button variant="link" asChild>
								<Link to={isLogin ? "/register" : "/login"}>
									{isLogin
										? "Don't have an account? Sign Up"
										: "Already have an account? Sign In"}
								</Link>
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}