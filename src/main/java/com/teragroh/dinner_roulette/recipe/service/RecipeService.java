package com.teragroh.dinner_roulette.recipe.service;

import com.teragroh.dinner_roulette.user.model.Users;
import com.teragroh.dinner_roulette.recipe.model.Recipe;
import com.teragroh.dinner_roulette.recipe.repository.RecipeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RecipeService {

    @Autowired
    RecipeRepo recipeRepo;

    public Recipe getRecipeById(Long id) {
        return recipeRepo.findById(id).orElseThrow(()-> new RuntimeException("Recipe not found"));
    }

    @Transactional
    public Recipe updateRecipe(Long id, Recipe updatedRecipe) {
        Recipe recipe = getRecipeById(id);
        recipe.setName(updatedRecipe.getName());
        recipe.setIngredients(updatedRecipe.getIngredients());
        recipe.setInstructions(updatedRecipe.getInstructions());
        recipe.setDescription(updatedRecipe.getDescription());
        recipe.setPrepTimeMinutes(updatedRecipe.getPrepTimeMinutes());
        recipe.setCookTimeMinutes(updatedRecipe.getCookTimeMinutes());
        return recipeRepo.save(recipe);
    }

    public List<Recipe> getAllRecipes() {
        return recipeRepo.findAll();
    }

    @Transactional
    public Recipe addRecipe(Recipe recipe, Users user) {
        recipe.setUser(user);

        if(recipe.getIngredients()!=null){
            recipe.getIngredients().forEach(ingredient->{
                ingredient.setRecipe(recipe);
            });
        }
        return recipeRepo.save(recipe);
    }

}
