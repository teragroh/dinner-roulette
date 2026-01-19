// Main configuration file that loads the appropriate environment config
import { config as developmentConfig } from "./development";
import { config as productionConfig } from "./production";
import { config as stagingConfig } from "./staging";

// Get environment from Vite environment variable or default to development
const environment =
	import.meta.env.VITE_ENV || import.meta.env.MODE || "development";

// Export the appropriate config based on environment
export const config = (() => {
	switch (environment) {
		case "production":
			return productionConfig;
		case "staging":
			return stagingConfig;
		default:
			return developmentConfig;
	}
})();

// Export individual values for convenience
export const { API_URLS, ENVIRONMENT } = config;
