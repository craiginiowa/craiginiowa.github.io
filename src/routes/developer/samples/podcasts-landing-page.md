---
title: Podcasts Landing Page
description: Scrolling slideshow story topper.
cid: developer
featured: false
published: false
images: [developer/large/podcasts.jpg]
thumbnail: developer/small/podcasts.jpg
tags: [javascript, in-depth, Storytelling Studio]
---

<script>
  import ExternalLink from "../../../lib/components/ExternalLink.svelte";  
</script>

# Podcasts Landing Page

USA TODAY's podcasts landing page was getting a bit long in the tooth. This was my update on it, built in Svelte and fed by a Google spreadsheet. The Detroit Free Press decided it wanted its own page, so I refactored the app to pull from a spreadsheet determined by which sheet was making the call to publish changes. Since then, the Oklahoman and the Austin American Statesman have begun making their own plans for podcast landing pages. Flexibility and reusability are good things.

<ExternalLink url="https://www.usatoday.com/podcasts/" text="USA TODAY Podcasts" />
<ExternalLink url="https://www.freep.com/podcasts/" text="Detroit Free Press Podcasts" />
