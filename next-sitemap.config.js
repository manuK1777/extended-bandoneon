/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://extendedbandoneon.com',
    generateRobotsTxt: true, // Also generates robots.txt
    exclude: ['/admin/*', '/login'],
  };
  