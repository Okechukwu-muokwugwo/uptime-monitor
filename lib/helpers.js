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

// Create a randomly generated Alpahnumeric charaters
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;

  if (strLength) {
    // Define a list of possible characters that can go into the string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const possibleCharactersLength = possibleCharacters.length;
    // Initialise a final string
    let str = '';

    // Create a for loop that will iterate over the possibleCharacters and append to the final string
    for (i = 0; i < strLength; i++) {
      // Get randomCharacter
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharactersLength));

      // Append the randomCharacter to final string
      str += randomCharacter;
    }
    // Retur n the final string
    return str;
  } else {
    return false;
  }
}

// Export the module
module.exports = helpers;