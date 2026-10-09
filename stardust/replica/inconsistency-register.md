# Inconsistency register — linde-mh.com/en replica

Hands-off policy: no audit was run and no user items were supplied, so no improvement candidate
is adopted. The three entries below come from extract's content-cap probe (`DESIGN.json
extensions.breakpoints.capRegister`). Every one is **deferred**: the recreation replicates the
captured value per template and changes nothing. Everything not listed here is frozen; any design
delta found by the gate is a defect, not an improvement.

## R-01 — Content max-width differs between templates

- **Evidence:** cap-probe at 2560 px (`DESIGN.json extensions.breakpoints.caps`): 1600 px on
  home, landing (E-models), program (E-Trucks) and static (Privacy-Statement); 1280 px on listing
  (Press) and article (News-Detail_101184); 640 px on form (Global-Contact-Form). Shell cap
  1600 px everywhere.
- **Finding:** the content column is capped per template, not site-wide — three widths coexist
  (1600 / 1280 / 640) with no responsive cause.
- **Minimal change:** none this run — each template keeps its own measured cap (landing, program,
  static, home 1600; listing, article 1280; form 640). A site-wide unification would be a redesign
  item.
- **Status:** deferred
- **Where:** all templates; the per-template cap is the recreation's container value and the
  `cap-probe --against` row checks it.

## R-02 — Single-section cap: media carousel slide capped at 1600 px on the home page

- **Evidence:** cap-probe at 2560 px: `div.innerWrap.slick-initialized > .slick-list > .slick-track
  > div.media-carousel-item.slick-slide` max-width 1600 px on https://www.linde-mh.com/en/ while
  neighbouring sections on the same page cap at the shell width.
- **Finding:** one carousel section carries its own cap equal to the shell cap; intent (slide =
  viewport-wide up to the shell) rather than a mistake — visually consistent with the shell.
- **Minimal change:** none — replicate the slide cap at 1600 px.
- **Status:** deferred
- **Where:** home (`unique` archetype), media carousel section.

## R-03 — Single-section cap: form item capped at 342 px on form pages

- **Evidence:** cap-probe at 2560 px: `form.form-section > fieldset > div > div.form-item`
  max-width 342 px on https://www.linde-mh.com/en/Forms/Global-Contact-Form/ inside a 640 px form
  column.
- **Finding:** form fields are half-column items (two per row at 640 px); the 342 px cap is the
  grid's column width, not a defect.
- **Minimal change:** none — replicate the form grid as captured.
- **Status:** deferred
- **Where:** form template (8 pages), form fieldsets.
