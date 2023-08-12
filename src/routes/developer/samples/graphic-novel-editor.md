---
title: Graphic Novel Editor
description: A tool for building a more graphic narrative.
cid: developer
featured: true
sortorder: 2
published: true
images:
  [
    developer/large/gne-projects.jpg,
    developer/large/gne-layout1.jpg,
    developer/large/gne-layout2.jpg,
  ]
thumbnail: developer/small/graphic-novel-editor.jpg
tags: [javascript, Des Moines Register]
---

# Graphic Novel Editor

The creators of Accused, a true crime podcast by the Cincinnati Enquirer, wanted to do something different for their third season: a graphic novel. I threw together a few test pages using illustrator Clay Sisk's illustrations to see if we could position images with real text, not drawn text, to produce a graphic novel like experience. We could, but it was going to mean a lot of manual labor inputting X and Y coordinates for images and text boxes in desktop and mobile layouts. I thought it would be quicker if I could throw together a simple layout editor to drag the pieces into place on the page, then click a "publish" button. The result was [this](https://www.cincinnati.com/storytelling/graphic-novel/accused-podcast/death-david-bocks-fernald/), which we all agreed turned out pretty well.

A short time later, we were approached to do a graphic novel treatment to accompany usatoday.com's coverage of the 100th anniversary of the 19th Amendment, which gave women the right to vote. I churned out three more graphic novels using the same tool I'd developed for Accused.

- [• Mary Church Terrell](https://www.usatoday.com/storytelling/graphic-novel/women-of-the-century/mary-church-terrell/)
- [• Elizabeth Cady Stanton](https://www.usatoday.com/storytelling/graphic-novel/women-of-the-century/elizabeth-cady-stanton/)
- [• Carrie Chapman Catt](https://www.usatoday.com/storytelling/graphic-novel/women-of-the-century/carrie-cady-stanton/)

It worked fine, but the tool had to be run locally, not over a network, so I was the only one producing the novels. When it looked like there would be a desire for more, I went to work on version 2 of the editor.

The app is a Svelte frontend hitting an Express server hosted on Google Firebase and saving data files and media assets to Firestore and Cloud Storage respectively. I basically copied a bunch of functionality from Illustrator: drag and drop, resize-and-rotate handles, buttons to change stacking order and align objects, option-drag to copy, multiple undo and redo, just to name a few features.

Here are some of the graphic novels produced with the new editor:

- [• Illustrated look at 5 new dinosaur discoveries](https://www.usatoday.com/storytelling/graphic-novels/graphics/dinosaur-discoveries/1618426665584/)
- [• The Other Side of the RV Boom](https://www.indystar.com/storytelling/graphic-novels/news/the-other-side-of-the-rv-boom/1652122721498/)
- [• How to game the numbers for Title IX](https://www.usatoday.com/storytelling/graphic-novels/news/investigations/title-ix/1651670436649/)
- [• Berry Tramel's look at the top 5 Oklahoma Nebraska football games.](https://www.oklahoman.com/storytelling/graphic-novels/sports/berry-tramels-oklahoma-nebraska-moments/1631716339403/)
