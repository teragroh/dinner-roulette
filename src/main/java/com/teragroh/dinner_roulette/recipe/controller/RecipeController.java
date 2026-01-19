package com.teragroh.dinner_roulette.recipe.controller;

import com.teragroh.dinner_roulette.common.model.UserPrincipal;
import com.teragroh.dinner_roulette.user.model.Users;
import com.teragroh.dinner_roulette.recipe.model.Recipe;
import com.teragroh.dinner_roulette.recipe.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @GetMapping("/recipes")
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        return ResponseEntity.ok(recipeService.getAllRecipes());
    }

    @PostMapping("/recipes")
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe, @AuthenticationPrincipal UserPrincipal user) {
        Users currentUser = user.getUser();
        Recipe savedRecipe = recipeService.addRecipe(recipe, currentUser);
        return ResponseEntity.ok(savedRecipe);
    }
}
