package com.teragroh.dinner_roulette.recipe;

import com.intuit.karate.junit5.Karate;

public class RecipeApiKarateTest {

    @Karate.Test
    Karate testRecipeApi() {
        return Karate.run("recipe-api").relativeTo(getClass());
    }
}

