/**
 * Helpers for various tasks 
 */

// Dependencies
const crypto = require('crypto')
const config = require('./config')

// Container for the module
const helpers = {};

// Define the hash key using SHA256
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false
  }
}

// Parse json to object without throwing 
helpers.parseJsonToObject = (str) => {
  try {
    let obj = JSON.parse(str)
    return obj;
  } catch (error) {
    return {};
  }
}


// Export the module
module.exports = helpers;