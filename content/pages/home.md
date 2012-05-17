<!--
title: An Essay Publishing App
linktext: Home
created: May 12, 2012
listorder: 1
tags: an,essay,publishing,app
-->
# An Essay Publishing App

Essayist is a bloggish app that lets you write your content in text (markdown) files. Okay, nothing crazy-original, but it was written because I wanted a site where:

1. Readability was paramount
2. Writing new articles was really easy and lightweight
3. It was performant if and when it got a lot of traffic
4. You can get up an running locally or in production in a few
5. Migrating to a new server isn't a pain

## See It Work

[Check it out](http://essayst.herokuapp.com/)

## Getting Started

    $ git clone git://github.com/katzgrau/essayist && cd essayist && node app.js

## A Little Bit of a Rant

Item 1 in the list above was just a theming issue. When you actually think about it, most websites have terrible readability. The text is small, and you may not realize it, but there's a lot of eye strain involved. I wanted something I could read comfortably. But this is a general issue that could be solved anywhere (like Wordpress).

When I write a post, I usually write it in a text file anyway because I'm not always online, and I don't write it in one sitting. Sometimes I'm on public transit, in an evil conglomerate coffee chain that charges for internet access, or at a conference that has "WiFi" (you know how that goes). Why spin up the full LAMP stack just because you want to publish some stuff? It gets pretty unwieldy.

Okay, so you don't care about that last point. You got Apache, MySQL, PHP and Wordpress set up, found a decent theme, and tweaked the settings. Now you realize it's slow as balls and you go looking for a caching plugin, because it'll never stand a chance when you front-page Hacker News again and again. Wordpress recreates it's entire universe on every page request (And on that note, you should come see my lovely talk at Wordcamp NYC).

## Writing Content

The `content` folder is where your posts and pages go. The *only* difference between posts and pages is that a pages list is collected an passed to the layout every time, primarily for the nav bar.

    content/
        pages/
            about.md
            home.md
        posts/
            my-pbj-van-plan-for-dumbo.md
            the-red-tiles-are-lava.md

## Performance Considerations

Essayist keeps parsed content in memory, so it doesn't read from disk and parse a file on every request. When it first starts up, nothing is in memory. As requests are made for content, the markdown is parsed and stored on an as-needed basis.

This is just basic caching, but keeps it very performant.

## Who Should Use This

It's written in js/node, and that sorta kinda means you need to be at least somewhat technical to use it. I originally wrote it for me, but I figure someone else might find it useful. In theory you could bolt an admin section on top of it to manage the markdown files, but I'm not feeling it.

## License

Copyright (C) 2012 Kenny Katzgrau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.