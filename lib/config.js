/**
 * Set and export configuration for environment variables
 */

// Container for the environments
const environments = {};

// Staging (default) environment
environments.staging = {
  "httpPort": 3000,
  "httpsPort": 3001,
  "envName": "staging",
  "hashingSecret": 'secretKey'
};

// Production environment
environments.production = {
  "httpPort": 5000,
  "httpsPort": 5001,
  "envName": "production",
  "hashingSecret": 'secretKey2'
};

// Enviroments to be exported
const currentEnvironment = typeof (process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check if the environment exists in the environments object
const environmentToExport = typeof (environments[currentEnvironment]) == "object" ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
