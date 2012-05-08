
/*
 * GET home page.
 */

var essayist = require('../lib/essayist');

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.content = function(req, res, next) {
  res.render('index', essayist.get(req, res))
};