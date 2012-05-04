
/*
 * GET home page.
 */

//var essayist = require('../lib');

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.content = function(req, res) {
  res.render('content', { title: 'Content' })
}