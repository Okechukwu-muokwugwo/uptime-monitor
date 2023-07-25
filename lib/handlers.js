/**
 * Request for handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define handlers
const handlers = {}

// Users
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for users' submethods
handlers._users = {};

// Users - post
handlers._users.post = (data, callback) => {
  // Check that all the required fields are filled out
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Check that the user doesn\'t exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password)
        if (hashedPassword) {
          //Create User
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            tosAgreement: true
          };

          // Store user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'Could not create user' })
            }
          })
        } else {
          callback(500, { 'Error': 'Could not hash user\'s password' })
        }
      } else {
        callback(400, { 'Error': 'User with the phone number already exists' })
      }
    })
  } else {
    callback(500, { 'Error': 'Missing required fields' })
  }
}
// Users - get
handlers._users.get = (data, callback) => {
  // Check that the phone does exists
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Look up the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // Remove hashed password before returning user data
        delete data.hashedPassword
        callback(200, data);
      } else {
        callback(404);
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }
}
// Users - put
handlers._users.put = (data, callback) => {
  // Check for the required field
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  // Check for optional fields for updating
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Look up the user
      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          // Update the necessary fields
          if (firstName) {
            userData.firstName = firstName
          }
          if (lastName) {
            userData.lastName = lastName
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the user update
          _data.update('users', phone, userData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update user' })
            }
          })
        } else {
          callback(400, { 'Error': 'The specified user does not exists' })
        }
      })
    } else {
      callback(400, { 'Error': 'Missing fields to update' })
    }
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }

}
// Users - delete
handlers._users.delete = (data, callback) => {
  // Check if the user input is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Look up the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // Delete the user
        _data.delete('users', phone, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete the specified user' })
          }
        })
      } else { 400, { 'Error': 'Could not find the specified user' } }
    })
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }

}

// Define ping handler
handlers.ping = (data, callback) => {

  // Callback should return HTTP status code and a payload, if one exists.
  callback(200)
}

// Define not found handler
handlers.notFound = (data, callback) => {

  callback(404)
}

// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Create containers for all tokens methods
handlers._tokens = {};

// Token - post
// Required data: phone and password
handlers._tokens.post = (data, callback) => {
  // Check for validity of the user's input
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if (phone && password) {
    // Look up the user that matches the phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the password and compare it with the one stored in userObject
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // Create user's tokenObject
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create a new token for the user' })
            }
          })
        }
      } else {
        callback(400, { 'Error': 'Could not hash the new user\s password' })
      }
    })
  } else {
    callback(400, { 'Error': 'Could not find the specified user' })
  }

}
// Tokens - get
handlers._tokens.get = (data, callback) => {

}
// Tokens - put
handlers._tokens.put = (data, callback) => {

}
// Tokens - delete
handlers._tokens.delete = (data, callback) => {

}

module.exports = handlers;