'use strict';

const percentEncode = require('./percentEncode')
    , { random32base64, defaultFor } = require('./helpers')
    , { createHmac } = require('crypto');

/** Public **/

/** OauthHeader() returns an Authentication header string to be sent with
 * each oauth request. It includes a signature which requires
 * a users oauth `secret`, http `method` and `url`, and the `params` included
 * in the request.
 */
function OauthHeader(consumerKey, consumerKeySecret, token, tokenSecret) {
  this.consumerKey = consumerKey;
  this.consumerKeySecret = consumerKeySecret;
  this.token = token;
  this.tokenSecret = tokenSecret;
}

/** key() returns the header key */
OauthHeader.prototype.key = function() {
  return 'Authorization';
}

/** value() returns an Authentication header string to be sent with
 * each oauth request. It includes a signature which requires
 * a users oauth `secret`, http `method` and `url`, and the `params` included
 * in the request.
 */
OauthHeader.prototype.value = function (method, url, params) {
  var self = this;

  params = defaultFor(params, {});

  let header = {
    oauth_consumer_key: self.consumerKey,
    oauth_nonce: random32base64(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: unixTimestamp().toString(),
    oauth_token: self.token,
    oauth_version: '1.0'
  };

  return stringify(sign(self, method, url, header, params));
}

/** Private **/

// unixTimestamp() generates a unix timestamp
function unixTimestamp() {
  return Math.floor(new Date() / 1000);
}

function stringify(obj) {
  let str = Object.keys(obj)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(obj[key])}"`)
    .join(', ');

  return 'OAuth ' + str;
}

function sign(oh, method, url, header, params) {
  let data = Object.assign({}, header, params);

  const parameterString = Object.keys(data)
    .sort()
    .map(key => percentEncode(key) + "=" + percentEncode(data[key]))
    .join('&');

  // build baseString;
  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(parameterString)
  ].join('&');

  // create signature
  const secret = percentEncode(oh.consumerKeySecret) + '&' + percentEncode(oh.tokenSecret);
  const signature = createHmac('sha1', secret)
    .update(baseString)
    .digest('base64');

  header.oauth_signature = signature;

  return header;
}

module.exports = exports = OauthHeader;
