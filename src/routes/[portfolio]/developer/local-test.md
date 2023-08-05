---
title: Local Test
description: Can I run an app locally?
layout: portfolio
cid: developer
featured: false
published: false
images: []
code: test/index.html
thumbnail: no-image.png
tags: [javascript]
---

This is a page with live code on it, placed there via iframe.

Dev work on the code is done using [local-web-server](https://github.com/lwsjs/local-web-server) to serve the code from it's project directory.

`$ ws --directory assets/code/test`

As it is simply static files, the code can also be developed elsewhere, say in a `svelte` project, and copied to the `assets/code` directory, or served from an external url.
