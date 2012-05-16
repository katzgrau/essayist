
/*
 * GET home page.
 */

var essayist = require('../lib/essayist');

exports.content = function(req, res, next) {
  res.render('index', essayist.get(req, res))
};

exports.sitemap = function(req, res, next) {
    essayist.sitemap(req, res);
};