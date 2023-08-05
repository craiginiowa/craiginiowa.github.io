---
title: Podcasts Landing Page
description: Scrolling slideshow story topper.
layout: portfolio
cid: developer
featured: false
published: false
images: [developer/large/podcasts.jpg]
thumbnail: developer/small/podcasts.jpg
link: https://www.usatoday.com/podcasts/
tags: [javascript, in-depth, Storytelling Studio]
---

# Podcasts Landing Page

USA TODAY's podcasts landing page was getting a bit long in the tooth. This was my update on it, built in Svelte and fed by a Google spreadsheet. The Detroit Free Press decided it wanted its own page, so I refactored the app to pull from a spreadsheet determined by which sheet was making the call to publish changes. Since then, the Oklahoman and the Austin American Statesman have begun making their own plans for podcast landing pages. Flexibility and reusability are good things.

{% include external-link.html url=page.link text="USA TODAY Podcasts" %}
{% include external-link.html url="https://www.freep.com/podcasts/" text="Detroit Free Press Podcasts" %}
