/**
 * This file contains the core (or really, all of) essayist. It might
 * be necessarry to break some of this out to different modules,
 * but I think its fine for now.
 *
 * The basic idea here is to
 *  1. Read the incoming request /[content-title]
 *  2. Look for [content-title].md in the contentPath setting/directory
 *  3. Parse it, and grab any meta info
 *  4. Cache the result in case we're asked for it again
 *
 * I'll expand on this later.
 *
 * @author Kenny Katzgrau <katzgrau@gmail.com>
 */
 
var fs        = require('fs'),
    path      = require('path'),
    marked    = require('marked'),
    _         = require('underscore');

/* These are instance-wide variables used for either configuration
 * or simple caching
 */
var cache = {};
var defaults = {
    theme: null,
    home: 'home',
    title: 'Anonymous',
    description: 'Just another Essayist app',
    contentPath: './content/pages/'
};

var config = {};
var pages = [];

/**
 * The public interface for configuring 
 * @param cfg object A hash of options. Valid options include
 *   theme: The theme to use (boxers, nordrum, coffee). Default is no theme
 *   home: The page that will act as the home page
 *   title: The title of the site
 *   description: The description of the site
 *   contentPath: Where the content is stored
 */
module.exports.config = function(cfg) {
    config = _.extend(defaults, cfg);
};

/**
 * The route handler for essayist
 * @param object request
 * @param object response
 */
module.exports.get = function(req, res) {

    console.log(req.headers.host);

    var isHome = false;
    // The default home page
    if(!req.params.slug) {
        req.params.slug = config.home;
        isHome = true;
    }

    /* Content filepath */
    var file = config.contentPath + req.params.slug + '.md';

    /* Does that content exist? */
    if(path.exists(file))
        throw Error("File or content not found :(");

    /* Check the cache first */
    if(cache[req.params.slug]) return cache[req.params.slug];

    var content = fs.readFileSync(file);
    var meta    = parseMeta(content.toString(), req.params.slug);

    content = marked(content.toString());

    cache[req.params.slug] = { theme: config.theme, 
                               title: config.title,
                               description: config.description,
                               content: content,
                               meta: meta,
                               pages: pages,
                               isHome: isHome };

    return cache[req.params.slug];
}

/**
 * Get and return all pages in an array. This is cached
 * @return array Of pages
 */
module.exports.getPages = function() {
    /* Grab all pages */
    var list = [], slug, title, content, meta;
    var pgs = fs.readdirSync(config.contentPath);

    /* Run through each page and parse the meta header */
    for(var i in pgs) {
        content = fs.readFileSync(config.contentPath + pgs[i]);
        slug = pgs[i].replace(/\.md$/, '');
        meta    = parseMeta(content.toString(), slug);
        title = meta.title;

        list.push({
            title: title,
            slug: slug,
            meta: meta
        })
    }

    /* Sort the pages by the 'listorder' meta field */
    list.sort(function(a, b) { 
        return parseInt(a.meta.listorder) - parseInt(b.meta.listorder)
    });

    return list;
}

/**
 * The route handler for /sitemap.xml
 * Will round up everything and send it. There's almost definitely
 *  a better way of doing this.
 */
exports.sitemap = function (req, res) {
    var sitemap, page_list = fs.readdirSync(config.contentPath);

    var xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for (var i in page_list) {
        xml += '<url>';
        xml += '<loc>http://'+ req.headers.host + '/' + page_list[i].replace(/\.md$/, '') + '</loc>';
        xml += '<changefreq>'+ 'monthly' +'</changefreq>';
        xml += '<priority>'+ '1' +'</priority>';
        xml += '</url>';
        i++;
    }
    xml += '</urlset>';

    res.header('Content-Type', 'text/xml');
    res.send(xml);
}

/**
 * A currently non-working handler for detecting and reloading changes to a file
 *  Important, but not critical for what I need it for
 */
function fileChangeHandler(event, filename) {
  /*
  if (filename) {
    console.log('file changed: ' + filename);
  } else {
    console.log('directory changed');
  }
  */
}

/**
 * Given a chunk of content pulled out of the markdown file, return
 *  a hash of meta values, like what the content title is, its list order
 *  when dropped into a list, when it was written, etc.
 * @param string content
 * @param string slug
 * @return object
 */
function parseMeta(content, slug) {
    var matches = content.match(/<\!\-\-(\s*(\w+)\s*:(.*)\s)*/gm);

    var meta    = {};
    var keyval  = '';

    if(matches && matches.length > 0) {
        matches     = matches[0].match(/(\w+)\s*:(.*)/g);
        for(i in matches) {
          keyval = matches[i].match(/(\w+)\s*:(.*)/);
            if(keyval.length > 1) {
                meta[keyval[1]] = keyval[2].replace(/^\s*|\s*$/g, '');
            } 
        }
    }

    return _.extend({
        title: '' || slug,
        linktext: '' || slug,
        type: 'page',
        created: '',
        listorder: 100,
    }, meta);
}


/* Configure the engine */
module.exports.config({});

/* Load the pages */
pages = module.exports.getPages();