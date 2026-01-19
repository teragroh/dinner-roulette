package com.teragroh.dinner_roulette.recipe.repository;

import com.teragroh.dinner_roulette.recipe.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRepo extends JpaRepository<Recipe,Long> {
}
