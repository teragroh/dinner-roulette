import type React from "react";

import { RecipeCard } from "./recipe-card";

function RecipeBox() {
	return (
		<div className="p-4 flex ">
			<RecipeCard
				title="Spaghetti"
				description="Classic spaghetti with tomato sauce and basil"
				durationMinutes={20}
				imageSrc="/spaghetti.jpg"
				imageAlt="Plate of spaghetti"
				recipeContent={`Ingredients:
• 400g spaghetti
• 2 tbsp olive oil
• 3 cloves garlic, minced
• 400g canned tomatoes
• Fresh basil leaves
• Salt and pepper to taste
• Parmesan cheese (optional)

Instructions:
1. Bring a large pot of salted water to boil
2. Add spaghetti and cook according to package directions
3. Heat olive oil in a large pan over medium heat
4. Add garlic and cook for 1 minute until fragrant
5. Add tomatoes, season with salt and pepper
6. Simmer for 10-15 minutes until sauce thickens
7. Drain pasta and toss with sauce
8. Garnish with fresh basil and serve hot`}
				className="w-80"
			/>
		</div>
	);
}

export { RecipeBox };
