'use strict';

const request = require('./lib/request')
    , OauthHeader = require('./lib/oauthHeader')
    , multipart = require('./lib/multipart');

let oauthHeader;

function setup(consumerKey, consumerSecret, token, tokenSecret) {
  oauthHeader = new OauthHeader(consumerKey, consumerSecret, token, tokenSecret);
}

/** tweet(String, String, ) tweets `imgData` of `imgContentType` with an
 * a `status` message.
 **/
async function tweet(status, imgContentType, imgData) {
  if (!oauthHeader) throw new Error('Client needs to be configured with setup() before being used');
  if (!isImage(imgContentType)) throw new Error('img must be a jpeg, png, gif');

  const media = await uploadImg(imgContentType, imgData);
  const resp = await tweetImg(status, [media.media_id_string]);
  return resp;
}

/** uploadMedia() uploads an image to twitter's media endpoint and retrieves
 * a media_id to be used in subsequent posts
 **/
async function uploadImg(contentType, data) {
  const endpoint = 'https://upload.twitter.com/1.1/media/upload.json';

  const headers = {}
  headers[oauthHeader.key()] =  oauthHeader.value('POST', endpoint);

  const msg = await request.postMultipart(endpoint, headers, [['media', contentType, data]]);
  return JSON.parse(msg);
}

async function tweetImg(status, mediaIds) {
  const endpoint = 'https://api.twitter.com/1.1/statuses/update.json';

  const params = {};
  params.status = status;
  if (mediaIds) {
    params.media_ids = mediaIds.join(',');
  }

  const headers = {}
  headers[oauthHeader.key()] =  oauthHeader.value('POST', endpoint, params);

  const msg = await request.post(endpoint, params, headers);
  return JSON.parse(msg);
}

function isImage(imageType) {
  return /image\/(jpeg|gif|png)/i.test(imageType);
};

module.exports = exports = {
  setup,
  tweet
};
