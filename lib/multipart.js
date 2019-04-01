'use strict';
// https://www.ietf.org/rfc/rfc2388.txt
// multipart/form-data

const { random32base64 } = require('./helpers')

function Part(name, type, value) {
  this.name = name;
  this.type = type;
  this.value = value;
}

function Multipart(parts) {
  this.boundary = random32base64();
  this.parts = [];
  if (parts) {
    this.parts = parts.map(part => new Part(...part));
  }
  this.body = '';
  this.build();
}

Multipart.prototype.addPart = function(name, type, value) {
  var self = this;

  self.items.push(new Part(name, type, value));
  self.build();
}  

Multipart.prototype.build = function() {
  const self = this;

  let str = '';
  const boundary = `--${self.boundary}`;

  self.parts.sort(part => part.name).forEach(part => {
    str = boundary;
    str += '\r\n';
    str += `Content-Disposition: form-data; name="${part.name}"; filename="image.jpeg"`;
    str += '\r\n';
    str += `Content-Type: ${part.type}`; // Figure how to calculate this programatically
    str += '\r\n\r\n';
    str += part.value;
    str += '\r\n';
    str += boundary;
  });

  str += `--\r\n`; //END
  self.body = str;
}

module.exports = exports = Multipart;
