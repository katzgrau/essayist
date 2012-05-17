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
    contentPath: './content/',
    ads: false,
    ad: '',
    hostOverrides: {}
};

var appConfig = {},
    hostConfigs = {},
    pages = {},
    sitemaps = {};

/**
 * The public interface for configuring the overall application
 * @param cfg object A hash of options. Valid options include
 *   theme: The theme to use (boxers, nordrum, coffee). Default is no theme
 *   home: The page that will act as the home page
 *   title: The title of the site
 *   description: The description of the site
 *   contentPath: Where the content is stored
 */
module.exports.config = function(cfg) {
    appConfig = _.extend(defaults, cfg);
};

/**
 * The route handler for essayist
 * @param object request
 * @param object response
 */
module.exports.get = function(req, res) {

    var isHome = false,
        config = getHostConfig(req),
        sitePages = getPages(req);

    /* The default home page */
    if(!req.params.slug) {
        req.params.slug = config.home;
        isHome = true;
    }

    /* Content filepath */
    var file = config.contentPath + 'pages/' + req.params.slug + '.md';

    /* Does that content exist? */
    if(!path.existsSync(file)) {
        console.log('No? ' + file);
        file = config.contentPath + 'posts/' + req.params.slug + '.md';

        if(!path.existsSync(file)) {
            throw Error('File or content not found: ' + file );
        }
    }

    /* Check the cache first */
    if(cache[req.headers.host] && cache[req.headers.host][req.params.slug]) 
        return cache[req.headers.host][req.params.slug];

    var content = fs.readFileSync(file);
    var meta    = parseMeta(content.toString(), req.params.slug);

    content = marked(content.toString());

    /* Makes some space */
    if(!cache[req.headers.host]) cache[req.headers.host] = {};

    cache[req.headers.host][req.params.slug] = {   theme: config.theme, 
                                                   title: config.title,
                                                   ads: config.ads,
                                                   ad: config.ad,
                                                   description: config.description,
                                                   content: content,
                                                   meta: meta,
                                                   pages: sitePages,
                                                   isHome: isHome };
 
    return cache[req.headers.host][req.params.slug];
}

/**
 * The route handler for /sitemap.xml
 * Will round up everything and send it. There's almost definitely
 *  a better way of doing this.
 * @todo Rewrite with async calls
 */
exports.sitemap = function (req, res) {
    var sitemap, xml, config = getHostConfig(req);

    if(sitemaps[req.headers.host]) {
        xml = sitemaps[req.headers.host];
    } else {
        var page_list = fs.readdirSync(config.contentPath + 'pages/'),
            post_list = fs.readdirSync(config.contentPath + 'posts/');

        var xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        /* Take care of the root page, the most important */
        xml += '<url>';
        xml += '<loc>http://'+ req.headers.host + '/</loc>';
        xml += '<changefreq>daily</changefreq>';
        xml += '<priority>1</priority>';
        xml += '</url>';


        for (var i in page_list) {
            xml += '<url>';
            xml += '<loc>http://'+ req.headers.host + '/' + page_list[i].replace(/\.md$/, '') + '</loc>';
            xml += '<changefreq>weekly</changefreq>';
            xml += '<priority>.8</priority>';
            xml += '</url>';
            i++;
        }
        
        for (var i in post_list) {
            xml += '<url>';
            xml += '<loc>http://'+ req.headers.host + '/' + post_list[i].replace(/\.md$/, '') + '</loc>';
            xml += '<changefreq>monthly</changefreq>';
            xml += '<priority>.6</priority>';
            xml += '</url>';
            i++;
        }

        xml += '</urlset>';
        sitemaps[req.headers.host] = xml;
    }

    res.header('Content-Type', 'text/xml');
    res.send(xml);
}

/**
 * Get the configuration for the current host (the host in
 * the request header)
 */
function getHostConfig(req) {
  /* If we already made it at some point, send it back */
  if(hostConfigs[req.headers.host]) {
    return hostConfigs[req.headers.host];
  }

  /* Start with the main config */
  /* Override the main config with any site overrides */
  var base = _.clone(appConfig);
  if(appConfig.hostOverrides[req.headers.host]) {
    hostConfigs[req.headers.host] = _.extend(base, appConfig.hostOverrides[req.headers.host])
  } else {
    hostConfigs[req.headers.host] = base;
  }

  return hostConfigs[req.headers.host];
}

/**
 * Get and return all pages in an array. This is cached
 * @return array Of pages
 */
function getPages(req) {
    /* Get the list if we've already looked for it */
    if(pages[req.headers.host])
        return pages[req.headers.host];

    /* Grab all pages */
    var list = [], slug, title, content, meta, config = getHostConfig(req);
    var pgs = fs.readdirSync(config.contentPath + 'pages/');

    /* Run through each page and parse the meta header */
    for(var i in pgs) {
        content = fs.readFileSync(config.contentPath + 'pages/' + pgs[i]);
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

    /* Cache */
    pages[req.headers.host] = list;

    return pages[req.headers.host];
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