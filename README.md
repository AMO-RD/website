# AMO Research and Development — website

Static site for AMO Research and Development: a single page with the hero, expertise strip, focus areas, approach, team and contact sections. No build step and no dependencies; the whole site is plain HTML, CSS and JavaScript.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page. All copy lives here. |
| `css/style.css` | Styles. Colours, fonts and spacing are tokens at the top of the file (`:root`), with the dark-theme values just below. |
| `js/main.js` | In-page navigation and the generated hero figure (the fan of paths). |
| `img/team/` | Team photos, square crops. |
| `img/logo/` | Logo files: full and compact lockups, each in a light and a reversed (for dark backgrounds) version, plus the square icon. All vector, no fonts required. |
| `img/og-image.png` | Social-sharing preview image (1200×630). |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Browser and home-screen icons. |

## Run locally

Open `index.html` directly, or serve the folder so the in-page links and image paths behave exactly as they will online:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on GitHub Pages

1. Push these files to the repository root (or to a `docs/` folder).
2. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, pick the branch and the root (or `/docs`), and save.
3. For a custom domain, add it under the same Pages settings; GitHub writes a `CNAME` file for you.

All paths in the site are relative, so it works at `https://<user>.github.io/<repo>/` as well as on a custom domain.

## Editing

- **Copy**: edit the text in `index.html`. Sections are marked with `<section id="…">`.
- **Team**: each person is a `<li class="person">` block in the Team section. Replace a photo by dropping a new square JPEG into `img/team/` and updating the `src`; larger photos will show at higher quality on sharp screens.
- **Colours**: change the token values in `:root` (light) and in the two dark blocks in `css/style.css`. The three highlight colours of the hero figure are `--path-1`, `--path-2` and `--path-3`.
- **Fonts**: Archivo, Source Serif 4 and IBM Plex Mono load from Google Fonts through the `<link>` in `index.html`. To self-host, replace that link with `@font-face` rules in `css/style.css`.
- **Social preview**: once the site has a domain, uncomment the `og:image` tag in `index.html` and set it to the absolute address of `img/og-image.png`.
- **Copyright year**: the footer shows the visitor's current year, set by `js/main.js`; the `2026` in `index.html` is only the fallback shown when scripts are off.
- **Contact**: `info@amord.ca` appears in the Contact section (with a copy button) and in the footer of `index.html`; `michael@amord.ca` and `angela@amord.ca` sit under each person in the Contact section. If an address changes, update the link text and the `href` (and, for the general address, the copy button's `data-copy` attribute).
