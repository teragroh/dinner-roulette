function fn() {
	var env = karate.env || "dev";
	karate.log("karate.env =", env);

	var config = {
		baseUrl: "http://localhost:8080",
	};

	if (env === "staging") {
		config.baseUrl = "https://staging.example.com";
	} else if (env === "prod") {
		config.baseUrl = "https://api.example.com";
	}

	return config;
}
