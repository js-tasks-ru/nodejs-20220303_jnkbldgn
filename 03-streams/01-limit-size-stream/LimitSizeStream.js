const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.size = 0;
    this.limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    const buffer = this.writableObjectMode ? this.objectToBuffer(chunk, encoding) : chunk;

    this.size += buffer.length;

    if (this.size > this.limit) {
      callback(new LimitExceededError());
    } else {
      callback(null, buffer);
    }
  }

  objectToBuffer(chunk, encoding) {
    switch (typeof chunk) {
      case 'string': {
        return Buffer.from(chunk, encoding);
      }
      case 'function':
      case 'undefined': {
        return Buffer.from(String(chunk), encoding);
      }
      default: {
        return Buffer.from(JSON.stringify(chunk), encoding);
      }
    }
  }
}

module.exports = LimitSizeStream;
