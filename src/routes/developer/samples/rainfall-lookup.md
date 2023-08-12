---
title: Rainfall Lookup
description: A look at changing rainfall patterns acroll the country
cid: developer
featured: false
published: true
images: [developer/large/rainfall-lookup.jpg]
thumbnail: developer/small/rainfall-lookup.jpg
tags: [javascript, in-depth, Storytelling Studio]
---

<script>
  import ExternalLink from "../../../lib/components/ExternalLink.svelte";  
</script>

# Rainfall Lookup

A lot of what reporters and editors come to the Storytelling Studio for is a way to present data they have compiled. In this case, we were given historical rainfall data and a mission to display trends over the last century while highlighting the driest and wettest years. The hunch was that heavy rainfall events are becoming more common, and clicking around the map, particularly in the midwest and northeast, the bars aquamarine-colored bars indicating wettest years do seem to bunch up to the right.

The technical details: Another Svelte app, utilizing a MapBox map, fed by CSV and GeoJSON files.

<ExternalLink url="https://www.usatoday.com/storytelling/news/investigation/rainfall-lookup/" text="Rainfall Lookup" />
