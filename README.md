# Song Yuhao — Academic Homepage

Personal academic homepage of **Song Yuhao (宋宇浩)**, undergraduate student in Automation at
Northeastern University, China. Research interests: large language models, embodied AI, and
time-series forecasting.

Live site (after GitHub Pages is enabled): <https://neumelon.github.io/Song-Yuhao/>

Plain static site (fonts are self-hosted, so nothing loads from a third-party CDN): **HTML + CSS + a little JavaScript**. No build step, no dependencies.

Bilingual: English by default; the **中文 / English** button in the top navigation switches the whole page in place
(no reload). The choice is remembered, and `?lang=zh` / `?lang=en` in the URL forces a language.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static server works, e.g. `npx http-server`.)

## File structure

```
index.html              All content, English text + Chinese in `data-zh` attributes
assets/
  css/style.css         Styles, light/dark themes via CSS variables
  js/main.js            Language + theme toggles, nav highlight, optional CV/photo detection
  favicon.svg           Placeholder favicon ("SY")
  fonts/                Self-hosted Newsreader (headings) and Inter (text), SIL OFL — see LICENSE.txt
  img/                  Put project images here
  cv.pdf                (you add) CV — button appears automatically
  profile.jpg           (you add) profile photo — appears automatically in the hero
robots.txt, sitemap.xml SEO
.nojekyll               Tells GitHub Pages to serve files as-is
.github/workflows/deploy.yml   Auto-deploy to GitHub Pages
```

## How to update

All content lives in `index.html`. English is the normal element text; the Chinese version of the same
element is in a `data-zh="…"` attribute (for attributes such as `aria-label` / `alt` / `title` use
`data-zh-aria-label` etc.). **When you add or change text, update both the English text and its `data-zh`.**
Elements without `data-zh` (e.g. paper titles, patent titles) are the same in both languages. Search for the section `id` (e.g. `id="publications"`).
Any block that is missing information is marked with an HTML comment starting with `TODO`.

### Publications
Copy an `<li class="pub">…</li>` block in the `#publications` section. Buttons are the
`<ul class="links">` items; delete a button you do not have. TODOs currently open:
author lists, journal name / year, conference name / year / DOI.

### Projects
Copy an `<article class="project">…</article>` block in `#projects` (a template comment is at the
top of that section). Supported optional parts: image (`project__media`), tags, and
Paper / Code / Project page buttons. Anything you leave out simply does not render, so a future
LLM or Embodied AI project only needs the parts it has.

### Patents
Copy an `<li class="pub">` block in `#patents`. Both entries are **published applications**, not
granted patents — change the wording only when a patent is actually granted. The English lines are
labeled "Informal translation (not official)".

### CV
Upload your CV as `assets/cv.pdf`. The **CV** button appears automatically.

### Profile photo
Add `assets/profile.jpg` (roughly square, ≥ 440×440 px, compressed). It appears automatically in
the hero. Until then no photo is shown.

> While `cv.pdf` / `profile.jpg` do not exist, the browser console shows two harmless 404 lines
> from the detection check. They disappear once both files are added.

### Social links (GitHub / Google Scholar / ORCID)
Commented-out buttons are in the hero (`<ul class="hero__links">`). Uncomment and fill in your real URL.

## Deploy to GitHub Pages

1. Merge this work into `main`.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes the site
   (it can also be run manually from the **Actions** tab).

This is a project repository (`Song-Yuhao`), so the site is served under `/Song-Yuhao/`. All asset
paths in the site are relative, so it works both there and at a domain root.

> Renaming the repository to `NEUMelon.github.io` would serve it from the root of that domain
> instead. If you do, update the URL in `index.html` (canonical, `og:url`, JSON-LD),
> `robots.txt`, and `sitemap.xml` .

### Custom domain
1. Create a file named `CNAME` in the repository root containing only your domain, e.g. `example.com`
   (the workflow copies it into the deployed site).
2. At your DNS provider add either a `CNAME` record pointing to `neumelon.github.io`
   (for a subdomain such as `www`) or the GitHub Pages `A`/`AAAA` records (for an apex domain) —
   see the [GitHub docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
3. In **Settings → Pages**, enter the custom domain and enable **Enforce HTTPS**.
4. Update the canonical / `og:url` / JSON-LD URLs in `index.html`, plus `robots.txt` and `sitemap.xml`.
