var fs        = require('fs'),
    path      = require('path'),
    marked    = require('marked'),
    _         = require('underscore');

var cache = {};
var defaults = {
    theme: null,
    home: 'home',
    title: 'Anonymous',
    contentPath: './content/pages/'
};

var config = {};
var pages = [];

module.exports.get = function(req, res) {

    // The default home page
    if(!req.params.slug)
        req.params.slug = config.home;

    // Content filepath
    var file = config.contentPath + req.params.slug + '.md';

    // Does that content exist?
    if(path.exists(file))
        throw Error("File or content not found :(");

    // Check the cache first
    if(cache[req.params.slug]) return cache[req.params.slug];

    var content = fs.readFileSync(file);
    content = marked(content.toString());

    cache[req.params.slug] = { theme: config.theme, 
                               title: config.title, 
                               content: content,
                               pages: pages };

    return cache[req.params.slug];
}

module.exports.config = function(cfg) {
    config = _.extend(defaults, cfg);
};

module.exports.getPages = function() {
    var list = [], slug, title;
    var pgs = fs.readdirSync(config.contentPath);
    for(var i in pgs) {
        slug = pgs[i].replace(/\.md$/, '');
        title = slug;

        list.push({
            title: title,
            slug: slug
        })
    }

    // TODO: Sort

    return list;
}

function fileChangeHandler(event, filename) {
  console.log('event is: ' + event);
  if (filename) {
    console.log('file changed: ' + filename);
  } else {
    console.log('directory changed');
  }
}

// Configure
module.exports.config({});
pages = module.exports.getPages();

console.log(fs.realpathSync(config.contentPath));
// Watch the directory for changes
fs.watch(fs.realpathSync(config.contentPath), {persistent: false}, function() {
    console.log('yea');
});