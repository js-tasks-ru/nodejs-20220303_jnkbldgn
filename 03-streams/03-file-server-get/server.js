const http = require('http');
const path = require('path');
const fs = require('fs');
const {constants: {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_IMPLEMENTED,
}} = require('http2');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);


  switch (req.method) {
    case 'GET':
      if (pathname.includes('/')) {
        res.statusCode = HTTP_STATUS_BAD_REQUEST;
        res.end('Bad request');
        break;
      }

      const filepath = path.join(__dirname, 'files', pathname);

      const fileReadStream = fs.createReadStream(filepath);

      fileReadStream
          .on('error', (err) => {
            res.statusCode = err.code === 'ENOENT' ?
            HTTP_STATUS_NOT_FOUND : HTTP_STATUS_INTERNAL_SERVER_ERROR;
            res.end();
          })
          .pipe(res)
          .on('error', () => {
            res.statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR;
            res.end('Internal server error');
          });

      req.on('aborted', () => fileReadStream.destroy());

      break;
    default:
      res.statusCode = HTTP_STATUS_NOT_IMPLEMENTED;
      res.end('Not implemented');
  }
});

module.exports = server;
