const http = require('http');
const app = require('../src/app');

let server;
let baseUrl = 'http://127.0.0.1:5001';

/**
 * Start test server instance on port 5001
 */
const startTestServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(5001, '127.0.0.1', () => {
      resolve(baseUrl);
    });
  });
};

/**
 * Stop test server instance
 */
const stopTestServer = () => {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
};

/**
 * Perform JSON HTTP request against test server
 */
const request = async (method, path, body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method: method.toUpperCase(),
    headers,
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}/api/v1${path}`, options);
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return {
    status: res.status,
    headers: res.headers,
    body: data,
  };
};

module.exports = {
  startTestServer,
  stopTestServer,
  request,
};
