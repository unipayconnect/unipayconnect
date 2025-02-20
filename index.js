require("module-alias/register");
// Import core functionalities
const core = require("@unipayconnect/core");
const api = require("@unipayconnect/api");

// Merge everything into a single module
module.exports = {
    ...core, // Expose all functions from core
    ...api   // Expose all functions from api
};