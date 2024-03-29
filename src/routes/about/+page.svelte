<script>
  import { base } from "$app/paths";
  import Billboard from "$lib/components/Billboard.svelte";
  // import ExternalLink from "$lib/components/ExternalLink.svelte";
</script>

<section class="page-content">
  <Billboard title="about me" />

  <img class="biopic" src="{base}/img/my-dumb-face.jpg" alt="My dumb face" />

  <p class="dropcap">
    Here's the part where I tell you all about myself, and that's not something
    that comes easily. Not that I suffer from debilitating shyness or anything,
    I'm just not the type to toot my own horn. So where to start?
  </p>
  <p>
    I'm a frontend developer with Dotdash Meredith, the fine folks who bring you
    People magazine, Better Homes & Gardens and Entertainment Weekly, among many
    others. Before that, I was a developer with Gannett, the newspaper company
    most famous for publishing USA Today. I've been in the newspaper industry
    since graduating from Iowa State University with a degree in journalism back
    when pica poles and proportion wheels were still a thing, but getting to
    "developer" took a somewhat circuitous route.
  </p>
  <p>
    <em
      >I don't want your life story. Just <a
        href="#tldr"
        style="color: var(--site-color, #a00)">skip to the end</a
      >.</em
    >
  </p>
  <p>
    I started out as a copy editor at the Omaha World-Herald. This was before
    everybody had a personal computer, but they were definitely something I
    thought I should check out. So I moseyed on over to the Nebraska Furniture
    Mart's electronics store and came away with a Macintosh Quadra 610 &mdash;
    25 MHz of screaming power with a 230 MB hard drive and an inexhaustible 64
    MB or RAM, all pumping thousands of colors to an expansive 14-inch CRT
    monitor.
  </p>
  <h3>The arts beckon</h3>
  <p>
    I was friends with the graphic artists at work, and they "loaned" me the
    installer disks for Adobe Photoshop and Aldus FreeHand. I spent many a long
    night running through tutorials in books like The Photoshop Bible and
    decided computer graphics were a lot more fun than catching subject-verb
    agreement errors and misplaced apostrophes. I moved to the graphics
    department and started building maps and bar charts, color-correcting photos
    and registering color separations on pages for the camera.
  </p>
  <p>
    After a few years of that, I moved to Lexington, Ky., (followed my future
    wife down there) and spent a couple of years at a small marketing firm
    honing my Photoshop and Quark Xpress skills while waiting for a job to open
    up at the local newspaper. An opening did eventually happen, and I joined
    the graphics department of the Lexington Herald-Leader.
  </p>
  <h3>My old Kentucky home</h3>
  <p>
    The Herald-Leader was great in that I got to do a little bit of everything:
    photo illustrations, <a href="{base}/graphics/recycling-hl">news graphics</a>, 3D
    renderings, <a href="{base}/illustrations/animals">pencil sketches</a>. It's where
    I really cut my teeth on the trade.
  </p>
  <p>
    Lexintgon was great, too. I really liked the city. It was just the perfect
    size with lots of golf courses and hiking trails and good restaurants. The
    one thing it didn't have was a reputation for great schools, something that
    became important with a 4-year-old and 1-year-old underfoot. You know who
    did have a great reputation for eduction? My home state of Iowa. So in 2004,
    I sent a resume to the Des Moines Register, the newspaper I grew up reading,
    the newspaper that inspired me to study journalism at Iowa State, and lo and
    behold, I was hired.
  </p>
  <p>
    The graphics department had four other artists, so it took me some time to
    carve out my niche there. There was Mark, a world class illustrator, and
    Katie, a wonderful designer, and Kelli, a wizard at organizing and
    researching a project, and Scott, the 3D illustration guy. Scott left just a
    few months after I joined, which turned out to be fortunate for me, because
    it left open the role of 3D illustrator, which I gladly claimed. Check out
    the <a href="{base}/graphics">graphics</a> and
    <a href="{base}/illustrations">illustrations</a> pages samples of my 3D work.
  </p>
  <h3>The digital frontier</h3>
  <p>
    All of this was about the time the Internet was really starting to cut into
    the print business, so there was a push to put our work on the web. For us,
    that meant interactive graphics, and interactive graphics meant Flash. (Just
    typing the word still makes me shudder.) One of the things I had done when I
    bought that Quadra 610 was dabble in programming. I learned the C language,
    completed a few game programming tutorials, and even bought a couple of
    volumes of Inside Macintosh, the official Apple developer documentation.
    With that background, Flash and it's scripting language, ActionScript, was a
    breeze to pick up, and so my transtion from graphic artist to developer had
    begun.
  </p>
  <p>
    Flash had it's pros and cons &mdash; lots of cons &mdash; but it was
    relatively easy to produce engaging interactive graphics on the newspaper's
    daily deadline. I did my share of games and quizzes but also a few larger
    scale projects of which I remain proud to this day: On the 50th anniversary
    of Buddy Holly's death near Clear Lake, Iowa, we published a project that
    made heavy use of Flash; and when a tornado decimated Parkersburg, Iowa, we <a
      href="{base}/developer/parkersburg-tornado">built a map</a
    > that showed the extent of the destruction with before and after photos and
    survivors' testimony.
  </p>
  <p>
    As I gained experience building interactive graphics, I worked on more
    data-driven graphics, stuff like election results, economic indicators, high
    school sports tournament results, etc. Out of that grew a need for me to
    learn some of the backend technology that stored and served up the data. The
    Register's website, and a few subsites built on WordPress, ran on PHP backed
    by MySQL databases, so I quickly picked those up. Where there's data,
    there's a want to manage that data, so I learned how to build admin
    dashboards for editors to access. For that I honed my knowledge of HTML, CSS
    and Javascript and frameworks like jQuery and Backbone. It's also where I
    developed my affinity for building dashboards.
  </p>
  <h3>A quasi-career change</h3>
  <p>
    As more of my workload became developer-centric, I moved from the Register's
    graphics department to the dev team. About this time, the newspaper industry
    was undergoing tremendous upheaval as subscriptions and ad revenue continued
    to decline. Gannett's reaction was to consolidate duties wherever it could,
    and not long after my move, it decided local development teams were a
    luxury, and I was moved into a regional team.
  </p>
  <p>
    As part of the Local Digital Soulutions Network, I still worked on projects
    for the Register but also stuff for other newspapers. In learning to develop
    for Presto, Gannett's company-wide content management system (CMS), I
    learned Node.js, Express and Angular. I put that knowledge to work building
    Pressbox, an internal analytics dashboard for Gannett reporters, and as a
    lead developer on <a
      href="https://www.usatoday.com/border-wall/"
      style="color: var(--site-color, #a00)">The Wall</a
    >, a Pulitzer Prize-winning project reporting on the U.S.-Mexico border
    fence.
  </p>
  <p>
    Based on that work, I was offered a position in Gannett's Storytelling
    Studio, whose purpose was to break new ground in
    digital storytelling, finding unique and original ways of engaging readers.
    We took text, images, video, audio, maps, charts, 3D models, VR, AR &mdash;
    everything was in our toolbox &mdash; and dreamed up new approaches to
    presenting the news and compelling human interest stories.
  </p>
  <p>
    As the newspaper industry continued to fall on hard times, it took a mandatory furlough week and a personnel cut to our team to get me to freshen up the resum&#233;. I sent out a few applications and heard back from Dotdash Meredith, another publishing company with a presence in Des Moines. I accepted an offer and have been plugging away, trying to figure out their very custom publishing system since January of 2023. It's a lot of XML work, a smattering of Java, and next to no javascript, which is where I'm most comfortable. I know there are teams in the company that work primarily with javascript, so I'll keep my eye on the internal job board. Until then, I miss newspapers, but I don't miss the stressing about job security.
  </p>
  <p id="tldr" class="tldr">
    <strong>tl;dr</strong> I studied journalism in college, started out as a newspaper
    copy editor, switched to the graphics department, picked up Flash, became
    a web developer for Gannett, then moved to Dotdash Meredith.
  </p>

  <!-- <ExternalLink url="/craig_johnson.pdf" text="Download my resume" /> -->
</section>

<style>
  .biopic {
    float: right;
    margin-left: 20px;
    max-width: 225px;
  }
</style>
