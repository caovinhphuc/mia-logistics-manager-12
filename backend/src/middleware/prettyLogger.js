const { v4: uuidv4 } = require('uuid');

function prettyLogger(req, res, next) {
  const start = Date.now();
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = reqId;
  res.setHeader('x-request-id', reqId);

  res.on('finish', () => {
    const ms = Date.now() - start;
    const log = [
      `➡️  ${req.method} ${req.originalUrl}`,
      `${res.statusCode}`,
      `${ms}ms`,
      `ip=${req.ip}`,
      `reqId=${reqId}`,
    ].join(' ');
    // eslint-disable-next-line no-console
    console.log(log);
  });

  next();
}

module.exports = { prettyLogger };
