var fs        = require('fs'),
    path      = require('path'),
    marked    = require('marked');

var cache = {};
var defaults = {
    theme: null
};

module.exports.get = function(req, res) {
    // Content filepath
    var file = './content/pages/' + req.params.slug + '.md';

    // Does that content exist?
    if(path.exists(file))
        throw Error("File or content not found :(");

    // Check the cache first
    if(cache[req.params.slug]) return cache[req.params.slug];

    var content = fs.readFileSync(file);
    content = marked(content.toString());

    cache[req.params.slug] = { theme: 'boxers', 
                               title: req.params.slug, 
                               content: content };

    return cache[req.params.slug];
}

module.exports.config = function(config) {

};