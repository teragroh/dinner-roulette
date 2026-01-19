import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormApi } from "@tanstack/react-form";

interface AuthFormFieldsProps {
	mode: "login" | "register";
	form: FormApi<any, undefined>;
	onFieldChange?: () => void;
}

export function AuthFormFields({ mode, form, onFieldChange }: AuthFormFieldsProps) {
	const isLogin = mode === "login";

	return (
		<div className="flex flex-col gap-4">
			{/* Username field */}
			<form.Field
				name="username"
				children={(field) => (
					<div className="grid gap-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							type="text"
							value={field.state.value}
							onChange={(e) => {
								field.handleChange(e.target.value);
								onFieldChange?.();
							}}
							required
						/>
					</div>
				)}
			/>

			{/* Email field (register only) */}
			{!isLogin && (
				<form.Field
					name="email"
					children={(field) => (
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={field.state.value}
								onChange={(e) => {
									field.handleChange(e.target.value);
									onFieldChange?.();
								}}
								required
							/>
						</div>
					)}
				/>
			)}

			{/* Password field */}
			<form.Field
				name="password"
				children={(field) => (
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={field.state.value}
							onChange={(e) => {
								field.handleChange(e.target.value);
								onFieldChange?.();
							}}
							required
						/>
					</div>
				)}
			/>

			{/* Confirm password (register only) */}
			{!isLogin && (
				<form.Field
					name="confirmPassword"
					children={(field) => (
						<div className="grid gap-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={field.state.value}
								onChange={(e) => {
									field.handleChange(e.target.value);
									onFieldChange?.();
								}}
								required
							/>
						</div>
					)}
				/>
			)}
		</div>
	);
}