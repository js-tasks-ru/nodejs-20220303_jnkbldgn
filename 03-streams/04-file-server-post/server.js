const http = require('http');
const path = require('path');
const fs = require('fs');
const {constants: {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_IMPLEMENTED,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_PAYLOAD_TOO_LARGE,
  HTTP_STATUS_CONFLICT,
}} = require('http2');

const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);


  switch (req.method) {
    case 'POST':
      const filepath = path.join(__dirname, 'files', pathname);

      if (pathname.includes('/')) {
        res.statusCode = HTTP_STATUS_BAD_REQUEST;
        res.end('Bad request');
        break;
      }

      if (fs.existsSync(filepath)) {
        res.statusCode = HTTP_STATUS_CONFLICT;
        res.end('File is exists');
        break;
      }

      const limitSizeStreamTransform = new LimitSizeStream({limit: 1048576});
      const fileWriteStream = fs.createWriteStream(filepath);

      req
          .pipe(limitSizeStreamTransform)
          .on('error', () => {
            fileWriteStream.destroy();
            fs.rmSync(filepath);
            res.statusCode = HTTP_STATUS_PAYLOAD_TOO_LARGE;
            res.end('Payload too large');
          })
          .pipe(fileWriteStream)
          .on('error', () => {
            fileWriteStream.destroy();
            res.statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR;
            res.end('Internal server error');
          })
          .on('finish', () => {
            res.statusCode = HTTP_STATUS_CREATED;
            res.end('Complited');
          });

      req.on('aborted', () => {
        fileWriteStream.destroy();
        fs.rmSync(filepath);
      });
      break;
    default:
      res.statusCode = HTTP_STATUS_NOT_IMPLEMENTED;
      res.end('Not implemented');
  }
});

module.exports = server;
