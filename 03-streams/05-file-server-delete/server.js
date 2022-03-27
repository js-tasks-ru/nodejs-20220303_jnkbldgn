const http = require('http');
const path = require('path');
const fs = require('fs');
const {constants: {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,

}} = require('http2');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  switch (req.method) {
    case 'DELETE':
      const filepath = path.join(__dirname, 'files', pathname);

      if (pathname.includes('/')) {
        res.statusCode = HTTP_STATUS_BAD_REQUEST;
        res.end('Bad request');
        break;
      }

      fs.access(filepath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = HTTP_STATUS_NOT_FOUND;
            res.end('File is not exist');
          } else {
            res.statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR;
            res.end('Internal server error');
          }
        } else {
          fs.rm(filepath, (err) => {
            if (err) {
              res.statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR;
              res.end('Internal server error');
            } else {
              res.statusCode = HTTP_STATUS_OK;
              res.end('Complited');
            }
          });
        }
      });
      
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
