/*
  Primary file for the API
*/

const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const stringDecorder = require("string_decoder").StringDecoder;
const config = require("./lib/config");
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiate HTTP server 
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start HTTP server 
httpServer.listen(config.httpPort, () => {
  console.log("The Server is listening now on port: " + config.httpPort + " on " + config.envName);
})

// Instantiate HTTPS server
const httpsServerOptions = {
  "key": fs.readFileSync("./https/key.pem"),
  "cert": fs.readFileSync("./https/cert.pem"),
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log("The Server is listening now on port: " + config.httpsPort + " on " + config.envName);
})

// All servers both HTTP and HTTPS
const unifiedServer = (req, res) => {

  // Get the URL and parse it
  const parseUrl = url.parse(req.url, true)
  // Get the path
  const path = parseUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');


  // Get the query string as an object
  const queryStringObject = parseUrl.query;

  // Get the HTTP method
  const method = req.method.toLowerCase()

  // Get the headers as object
  const headers = req.headers;

  // Get the payload, if any
  const decoder = new stringDecorder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data)
  })

  req.on("end", () => {
    buffer += decoder.end();

    const selectedHandler = typeof (router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handlers
    const data = {
      "trimedPath": trimmedPath,
      "queryStringObject": queryStringObject,
      "method": method,
      "headers": headers,
      "payload": helpers.parseJsonToObject(buffer),
    };

    // Route the request to the hanlder specified in the router
    selectedHandler(data, (statusCode, payload) => {
      statusCode = typeof (statusCode) == "number" ? statusCode : 200;
      payload = typeof (payload) == "object" ? payload : {};

      // Stringify the object before sending
      const payloadString = JSON.stringify(payload)

      // Returning header as the Content-Type: application/json
      res.setHeader("Content-Type", "application/json")

      // Return the request
      res.writeHead(statusCode)

      // Send the response
      res.end(payloadString);

      // Log the request
      console.log("Returning this response: ", statusCode, payloadString);
    });
  });
};

// Define a router for Request
const router = { 
  "ping": handlers.ping,
  "users": handlers.users 
};