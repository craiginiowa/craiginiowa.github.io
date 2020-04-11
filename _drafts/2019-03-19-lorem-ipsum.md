---
layout: post
title: Lorem ipsum dolor sit amet
slug: lorem-ipsum-dolor
author: Craig Johnosn
_date: 2019-03-19 15:04:00 -0600
categories: dev
pinned: false
image:
    url: assets/img/cyclones-mbb-four.jpg
    caption: This is the image caption.
    credit: photo credit
---

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmo tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commod consequat.

{% include right-rail-image.html url="assets/img/prohm.jpg" caption="This is the caption for the mug of Steve Prohm. He is the coach of Iowa State men's basketball." %}

Duis aute irure dolor in reprehenderit in voluptate velit ess cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat no proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmo tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commod consequat.

Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commod consequat.

{% raw %}
```html
<div class="post-image">
    <img src="{{ page.image.url | relative_url }}">
    {% if page.image.caption %}
    <p>{{ page.image.caption }}{% if page.image.credit %}<b>{{ page.image.credit }}</b>{% endif %}</p>
    {% endif %}
</div>
```
{% endraw %}

Sed do eiusmo tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commod consequat.

{% include right-rail-image.html url="assets/img/cyclones-mbb-four.jpg" caption="This is the caption for the picture of THT, Shayock, Weiler-Babb, Haliburton and Jacobsen." %}

Duis aute irure dolor in reprehenderit in voluptate velit ess cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat no proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed do eiusmo tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commod consequat.

Duis aute irure dolor in reprehenderit in voluptate velit ess cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat no proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
