const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a directory inside the project root so Render keeps it
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
