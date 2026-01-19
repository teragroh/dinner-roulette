import * as React from "react";
import { useState } from "react";

import {
	Card,
	CardTitle,
	CardDescription,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

type RecipeCardProps = {
	title?: string;
	description?: string;
	durationMinutes?: number | string;
	imageSrc?: string;
	imageAlt?: string;
	recipeContent?: string;
	className?: string;
};

function RecipeCard({
	title = "Recipe",
	description = "",
	durationMinutes,
	imageSrc,
	imageAlt = "",
	recipeContent = "Recipe instructions go here...",
	className,
}: RecipeCardProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const cardBase =
		`h-100 flex flex-col overflow-hidden ${className ?? ""}`.trim();

	return (
		<div className={`relative ${cardBase}`} style={{ perspective: '1000px' }}>
			<div
				className={`relative w-full h-full transition-transform duration-700 transform-gpu ${
					isFlipped ? 'rotate-y-180' : ''
				}`}
				style={{ transformStyle: 'preserve-3d' }}
			>
				{/* Front Face */}
				<Card className="absolute inset-0 backface-hidden">
					{imageSrc && (
						<div className="h-1/2 w-full overflow-hidden">
							<img
								src={imageSrc}
								alt={imageAlt}
								className="w-full h-full object-cover rounded-b-2xl"
							/>
						</div>
					)}

					<CardHeader>
						<CardTitle>{title}</CardTitle>
						<CardAction>
							<button
								onClick={() => setIsFlipped(true)}
								className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
							>
								Full recipe
							</button>
						</CardAction>
					</CardHeader>

					<CardContent>{description}</CardContent>

					<CardFooter>
						<div className="flex items-center justify-between w-full text-sm text-muted-foreground">
							<div>
								{durationMinutes != null ? (
									<span className="flex items-center gap-2">
										<span aria-hidden>⏱</span>
										<span>{String(durationMinutes)} min</span>
									</span>
								) : (
									<span>—</span>
								)}
							</div>
							<div />
						</div>
					</CardFooter>
				</Card>

				{/* Back Face */}
				<Card className="absolute inset-0 backface-hidden rotate-y-180">
					<CardHeader>
						<CardTitle>{title} - Recipe</CardTitle>
						<CardAction>
							<button
								onClick={() => setIsFlipped(false)}
								className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
							>
								Back
							</button>
						</CardAction>
					</CardHeader>

					<CardContent className="flex-1 overflow-y-auto">
						<div className="prose prose-sm max-w-none">
							<p className="text-sm leading-relaxed whitespace-pre-line">
								{recipeContent}
							</p>
						</div>
					</CardContent>

					<CardFooter>
						<div className="text-xs text-muted-foreground">
							Total time: {durationMinutes || '—'} minutes
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

export { RecipeCard };
