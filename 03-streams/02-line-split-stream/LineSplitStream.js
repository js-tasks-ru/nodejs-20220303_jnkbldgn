const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.lastEl = '';
  }

  async _transform(chunk, encoding, callback) {
    const text = chunk.toString();
    const matches =(this.lastEl + text).split(os.EOL).filter((it) => !!it);

    if (text[text.length - 1] !== os.EOL) {
      this.lastEl = matches.pop();
    }

    matches.forEach((it) => this.push(it));

    callback();
  }

  _flush(callback) {
    if (!!this.lastEl) {
      this.push(this.lastEl);
      this.lastEl = '';
    }
    callback();
  }
}

module.exports = LineSplitStream;
