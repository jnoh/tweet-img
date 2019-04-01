'use strict'

const http = require('http')
    , https = require('https')
    , Url = require('url')
    , percentEncode = require('./percentEncode')
    , Multipart = require('./multipart')
    , { defaultFor } = require('./helpers');

let methods = {
  GET: 'GET',
  POST: 'POST'
};

/** request() makes a https request to `url` with the specified
 * `options` and `postData`
 * Returns a response object
 */
async function request(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const options = { method, headers };

    const parsedURL = Url.parse(url)
    let httpModule = (parsedURL.protocol === 'https:' ? https : http)

    const req = httpModule.request(url, options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    });

    req.on('error', (e) => reject(e));

    // write data to request body
    if (body) {
      req.write(body);
    }

    req.end();
  })
}

/** get() makes a get https request to `url` with given `params`
 * Returns a response object
 */
async function get(url, params, headers) {
  params = defaultFor(params, {});
  headers = defaultFor(headers, {});

  const paramsStr = Object.keys(params)
    .map(key => percentEncode(key) + '=' + percentEncode(params[key]))
    .join('&');

  return request(methods.GET, `${url}?${paramsStr}`, headers);
}

/** post() makes a post https request to `url` with given `params`
 * Returns a response object
 */
async function post(url, params, headers) {
  params = defaultFor(params, {});
  headers = defaultFor(headers, {});

  const body = Object.keys(params)
    .map(key => percentEncode(key) + '=' + percentEncode(params[key]))
    .join('&');

  headers = Object.assign({}, headers, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body)
  });

  return request(methods.POST, url, headers, body);
}

/** multipartPost() sends a POST request with a body formatted as 
 * multipart/form-data. `data` should be an array of parts 
 * [name, type, value] 
 * 
 * https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4
 */
async function postMultipart(url, headers, parts) {
  headers = defaultFor(headers, {});

  const multipart = new Multipart(parts);
  const body = Buffer.from(multipart.body, 'binary');

  headers = Object.assign({}, headers, {
    'Content-Type': 'multipart/form-data; boundary=' + multipart.boundary,
    'Content-Length': body.length
  });

  return request(methods.POST, url, headers, body);
}

module.exports = exports = { get, post, postMultipart }
