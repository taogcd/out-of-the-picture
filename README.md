# Out of the Picture

**Anatomy, omission and rearrangement**

A public edition of the comparative archive, prepared for GitHub Pages.

A comparative image archive by Tao. It brings together 39 plates by Thomas
Geminus (1545) and 105 distinct source scans from works by Andreas Vesalius
(1543), with 107 source-page connections.

## Explore

- **Catalogue:** all groups 01–39 in reference-PDF order, with paired images,
  inclusive change filters and a clear reset to all 39 records.
- **Compare:** every source page in a group is visible together, as in the PDF.
  Switch between all 39 NYPL reference images and 38 larger Wellcome scans.
  Inspect any source in a pair or adjustable overlay, zoom, and examine six
  selected study pairs. Full observations and unresolved-source notes remain
  attached to all 39 groups.
- **Overlay export:** choose Grid or Clear, select Export PNG, then Save PNG to download
  the visible composition with its blend, zoom, position and monochrome/colour setting.
  Clear removes the canvas grid and background; the scanned paper stays part of
  each image. PNG output has a transparent canvas in Clear mode and is bounded
  to 4096 pixels on its longest edge using the locally displayed source scans.
- **Atlas:** select rectangular crops from the original images, arrange them,
  and return each fragment to its source page and location.
- **About & sources:** read the research context and consult collection records.

The atlas is saved locally in the visitor's browser. Save/open arrangement
controls export and import its editable JSON file. Atlas arrangements are not
uploaded to a shared server. A new website address has separate browser storage;
use Save arrangement on the previous site and Open arrangement here to transfer
work between them.

## Mobile browsing

The same website adapts to phones, tablets and desktops. On phones:

- Four navigation buttons remain within reach at the bottom of the screen.
- Search and filters fit the screen; all 39 groups and original numbers remain.
- Inspect a pair, then choose **Vesalius**, **Geminus** or **Both**. Use **+** to
  enlarge a page and drag to pan. **Fit** restores normal scrolling over the
  image. **Select fragment** enables drawing a crop; tap it again to cancel.
- The atlas initially fits the screen. Use its **+** to work closer, **Fit
  board** to see the whole arrangement, and **Edit selected** to reach a
  fragment's size, rotation, note and source controls. Drag coordinates remain
  consistent when the board is enlarged or the phone is rotated.
- Source records and detail viewers fill the mobile screen.

The bottom navigation respects the phone's safe area. Page proportions,
source links, existing saved arrangements and original image files are retained.

## GitHub Pages publishing

This repository uses the **Publish anatomical archive** workflow. Each update
on `main` publishes the current HTML, CSS, JavaScript and comparison index.
The workflow only reads repository contents; it does not commit or push changes.

Collection images and the original comparison PDF are stored in the complete
`Out_of_the_Picture_1.0.zip` asset attached to release `v1.0.0`. On publication,
the workflow verifies the package SHA-256, restores its images and PDF, and
applies the current website files from this repository. An `assets` or
`reference` folder added to the repository can override individual bundled
files while retaining all other source images.

To review or edit the full archive locally, download the complete release ZIP
and keep its `assets` and `reference` directories alongside `index.html`.

## Local preview

From this directory:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

## Files

- `index.html`: interface and introductory text.
- `style.css`: archive layout.
- `mobile.css`: responsive layout, mobile navigation and touch controls.
- `app.js`: catalogue, comparison and atlas interactions.
- `data.js`: all comparison metadata, image paths, sources and study crops.
- `assets/`: page scans, thumbnails, six study pairs and all 39 NYPL PDF images.
- `reference/Geminus_Vesalius_39_comparisons.pdf`: the supplied source PDF, unchanged.
- `comparison-index.csv`: the complete numbered comparison and source index.

## Image sources and interpretation

- Vesalius, *De humani corporis fabrica libri septem* (1543):
  Universitätsbibliothek Basel, UBH AN I 15, via e-rara.
  https://doi.org/10.3931/e-rara-20094
- Vesalius, *Epitome* (1543): Wellcome Collection.
  https://wellcomecollection.org/works/g6b6smge
- Geminus, *Compendiosa totius anatomie delineatio* (1545): all 39 NYPL
  reference images and 38 larger Wellcome Collection alternatives.
  https://wellcomecollection.org/works/dweu2ycs

Individual records include original-scan links and corresponding NYPL records.
Black scanning borders have been removed; page proportions are retained.
Images are fitted independently and are not displayed at a shared physical
scale. Colour and paper differences between copies are distinct from changes
to the composition. No historical images have been generated or redrawn by AI.

Records 19, 22, 24 and 28 retain explicit notes about details whose source
correspondences remain partly unconfirmed. An inscription absent from one
plate is not necessarily absent from the book. Historical re-engraving is
distinct from the contemporary digital cropping performed by the visitor.

## Review status and provenance

This draft extends the previously published Site source commit
`b68f8e297e468c2547dc5bd0015f5384aa684d0e`.

All 39 groups and their 107 source-page connections were checked against the
supplied comparison PDF. Each group displays all its source pages. Per-group PDF links have been removed;
the complete reference remains available under About & sources. Existing archive image assets are unchanged; the
39 added NYPL JPEGs are byte-for-byte copies of the reference source files.
No AI-generated imagery is used.

The previous interface classified groups 01–04 only as “Omitted”, causing them
to disappear under “Landscape / setting”. Change filters now support overlap:
all groups 01–16 appear under Landscape / setting. Filters retain record numbers
and have a prominent reset control. The initial catalogue shows all 39 groups.

Checks passed for asset integrity, all group/source coverage, source switching,
and atlas provenance using DOM interaction simulations. The live GitHub Pages
catalogue, multi-page comparison, copy switching and atlas provenance were also
checked in a desktop browser. Mobile pointer simulations passed at widths of
320, 375, 390, 430 and 700 pixels, covering scrolling, crop coordinates, image
switching, board zoom, scaled dragging/resizing and orientation changes. These
are simulated interactions, not real-device browser testing. GitHub Pages publishes this edition from the repository. The earlier Sites edition is separate.

To review locally, unzip the package and open `index.html`, or use the local
preview command above. Site hosting configuration and credentials are excluded.
