const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200', // URL FRONT 
    env: {
      apiUrl: 'http://localhost:8081/api' // URL API
    },
    setupNodeEvents(on, config) {
      // Tu pourras y ajouter des plugins plus tard
    },
  },
});
