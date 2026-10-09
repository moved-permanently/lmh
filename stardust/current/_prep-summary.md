# extract --prep summary — linde-mh.com/en (2026-10-06)

Inventory:    99 pages crawled (0 prior, 99 new) of 100 selected; 1 failure: /en/Product-Finder/ HTTP 404
Provenance:   99/99 live (every page has Playwright evidence)
Page types:   program 19 · landing 32 · listing 11 · static 7 · form 8 · unique 4 · article 18
              (LLM-inferred from URL pattern + vision template label; see _page-types.json)
Wait summary: medium ×92 (avg 2500 ms), slow ×7 (avg 5000 ms)
Vision check: 96 ok, 3 suspect — _crawl-log.json#visionCheck (3 suspect: scroll-reveal sections blank in the full-page screenshot; DOM content captured)
Capture gaps: uncaptured first-level targets: en 32, en/EDI 1 (fixed scope — recorded as scope debt)
Module candidates: 11
  site-header           all 99 pages  [high]
  site-footer           all 99 pages  [high]
  related-teasers       34 pages (news articles, program pages)  [high]
  press-contact         18 news-detail pages  [high]
  share-bar             86 pages  [high]
  benefits-grid         9+ program/landing pages  [medium]
  model-range-cards     product category and landing pages  [medium]
  testimonials          3+ landing pages  [medium]
  features              5 landing pages  [medium]
  quick-link-tiles      home  [medium]
  contact-form          8 form pages  [high]
Content caps: shell 1600px · probeWidth 2560 · consistent: see capRegister
Typed slots:  filled per page-type (pages/<slug>.json § slots)

## Per-page evidence

path | live | waitMode | waitMs | fetchedAt | httpStatus | media(img/bg) | flag | type
--- | --- | --- | --- | --- | --- | --- | --- | ---
/en/About-us/Awards/ | yes | medium | 2500 | 2026-10-06T11:18:25.281Z | 200 | 60/0 |  | program
/en/About-us/Certificates/ | yes | medium | 2500 | 2026-10-06T11:18:23.537Z | 200 | 3/0 |  | program
/en/About-us/Company/ | yes | medium | 2500 | 2026-10-06T11:18:25.281Z | 200 | 52/0 |  | landing
/en/About-us/Events/ | yes | medium | 2500 | 2026-10-06T11:18:30.593Z | 200 | 27/0 |  | listing
/en/About-us/Innovations-from-Linde/ | yes | medium | 2500 | 2026-10-06T11:19:02.121Z | 200 | 30/0 |  | listing
/en/About-us/Magazine/ | yes | medium | 2500 | 2026-10-06T11:19:06.076Z | 200 | 117/0 |  | listing
/en/About-us/Media/ | yes | slow | 5000 | 2026-10-06T11:56:06.064Z | 200 | 2/0 |  | listing
/en/About-us/Press/ | yes | medium | 2500 | 2026-10-06T11:19:45.620Z | 200 | 176/0 |  | listing
/en/About-us/Sustainability/ | yes | medium | 2500 | 2026-10-06T11:19:45.569Z | 200 | 25/0 |  | program
/en/About-us/Working-at-Linde/ | yes | medium | 2500 | 2026-10-06T11:19:48.252Z | 200 | 26/0 |  | landing
/en/About-us/ | yes | medium | 2500 | 2026-10-06T11:17:10.929Z | 200 | 11/0 |  | listing
/en/EDI/ | yes | medium | 2500 | 2026-10-06T11:17:10.061Z | 200 | 2/0 |  | static
/en/Forms/agility-on-point-form/ | yes | medium | 2500 | 2026-10-06T11:20:24.029Z | 200 | 2/0 |  | form
/en/Forms/Automation-Campaign/ | yes | medium | 2500 | 2026-10-06T11:20:57.139Z | 200 | 2/0 |  | form
/en/Forms/Ex-Proof_Form/ | yes | medium | 2500 | 2026-10-06T11:20:57.232Z | 200 | 2/0 |  | form
/en/Forms-GC/Li-ION-Recycling/ | yes | medium | 2500 | 2026-10-06T11:20:21.279Z | 200 | 2/0 |  | form
/en/Forms-GC/Next-Champ-Form/ | yes | medium | 2500 | 2026-10-06T11:20:21.431Z | 200 | 2/0 |  | form
/en/Forms/Global-Contact-Form/ | yes | medium | 2500 | 2026-10-06T11:20:59.689Z | 200 | 2/0 |  | form
/en/Forms/GSE-Expo/ | yes | medium | 2500 | 2026-10-06T11:21:32.932Z | 200 | 2/0 |  | form
/en/Forms/Rent-A-Truck/ | yes | medium | 2500 | 2026-10-06T11:21:33.802Z | 200 | 2/0 |  | form
/en/Landingpage/Agility-on-point/ | yes | medium | 2500 | 2026-10-06T11:21:36.034Z | 200 | 12/0 |  | landing
/en/Landingpage/Automation-Summit-2025/ | yes | medium | 2500 | 2026-10-06T11:22:09.612Z | 200 | 68/0 |  | landing
/en/Landingpage/Compact-class-with-electric-drive/ | yes | medium | 2500 | 2026-10-06T11:22:11.084Z | 200 | 43/0 |  | landing
/en/Landingpage/E-models/ | yes | medium | 2500 | 2026-10-06T11:22:13.633Z | 200 | 41/0 |  | landing
/en/Landingpage/Glasses/ | yes | medium | 2500 | 2026-10-06T11:22:45.645Z | 200 | 15/0 |  | landing
/en/Landingpage/GSE-Expo/ | yes | medium | 2500 | 2026-10-06T11:22:47.725Z | 200 | 11/0 |  | landing
/en/Landingpage/H-models/ | yes | medium | 2500 | 2026-10-06T11:22:51.480Z | 200 | 65/0 |  | landing
/en/Landingpage/Happy-Driver/ | yes | medium | 2500 | 2026-10-06T11:23:23.100Z | 200 | 29/0 |  | landing
/en/Landingpage/In-Sync/ | yes | slow | 5000 | 2026-10-06T11:56:45.099Z | 200 | 16/0 |  | landing
/en/Landingpage/Logimat/ | yes | medium | 2500 | 2026-10-06T11:23:28.800Z | 200 | 36/0 |  | landing
/en/Landingpage/Next-Champ/ | yes | medium | 2500 | 2026-10-06T11:24:00.107Z | 200 | 9/0 |  | landing
/en/Landingpage/Platform-Counterbalanced-Trucks/ | yes | medium | 2500 | 2026-10-06T11:24:02.139Z | 200 | 45/0 |  | landing
/en/Landingpage/R-Matic/ | yes | medium | 2500 | 2026-10-06T11:24:06.039Z | 200 | 32/0 |  | landing
/en/Landingpage/Safely-to-the-top/ | yes | slow | 5000 | 2026-10-06T11:56:45.098Z | 200 | 22/0 |  | landing
/en/Landingpage/Semi-automated-order-pickers/ | yes | slow | 5000 | 2026-10-06T11:57:24.284Z | 200 | 3/0 |  | static
/en/Landingpage/X-models/ | yes | medium | 2500 | 2026-10-06T11:24:43.282Z | 200 | 66/0 |  | landing
/en/Landingpage/X-Range/ | yes | medium | 2500 | 2026-10-06T11:25:13.045Z | 200 | 36/0 |  | landing
/en/Legal-Notes/Cookie-Policy/ | yes | medium | 2500 | 2026-10-06T11:25:14.886Z | 200 | 2/0 |  | static
/en/Legal-Notes/Legal/ | yes | medium | 2500 | 2026-10-06T11:25:18.883Z | 200 | 2/0 |  | static
/en/Legal-Notes/PPAP/ | yes | medium | 2500 | 2026-10-06T11:25:48.709Z | 200 | 2/0 |  | static
/en/Legal-Notes/Privacy-Statement/ | yes | medium | 2500 | 2026-10-06T11:25:51.193Z | 200 | 2/0 |  | static
/en/Legal-Notes/Terms-of-use/ | yes | medium | 2500 | 2026-10-06T11:25:54.416Z | 200 | 2/0 |  | static
/en/Linde-Core/Linde-Ergonomics.html | yes | medium | 2500 | 2026-10-06T11:26:26.683Z | 200 | 63/0 |  | program
/en/Linde-Core/Linde-Productivity.html | yes | medium | 2500 | 2026-10-06T11:26:27.443Z | 200 | 27/0 |  | program
/en/Productfinder.html | yes | slow | 5000 | 2026-10-06T11:57:23.674Z | 200 | 2/0 |  | unique
/en/Products/Approved-Trucks/ | yes | medium | 2500 | 2026-10-06T11:26:30.752Z | 200 | 49/0 |  | program
/en/Products/Automated-Trucks/ | yes | medium | 2500 | 2026-10-06T11:27:03.457Z | 200 | 27/0 |  | listing
/en/Products/Diesel-Forklifts/ | yes | medium | 2500 | 2026-10-06T11:27:07.447Z | 200 | 30/0 |  | program
/en/Products/Diesel-forklifts/ | yes | medium | 2500 | 2026-10-06T11:27:04.483Z | 200 | 30/0 |  | program
/en/Products/E-Trucks/ | yes | medium | 2500 | 2026-10-06T11:27:39.607Z | 200 | 15/0 |  | program
/en/Products/Explosion-Proof-Trucks/ | yes | medium | 2500 | 2026-10-06T11:27:42.003Z | 200 | 46/0 |  | program
/en/Products/Forklift-Hire/ | yes | medium | 2500 | 2026-10-06T11:27:44.646Z | 200 | 36/0 |  | program
/en/Products/Forklift-Truck/ | yes | medium | 2500 | 2026-10-06T11:28:17.001Z | 200 | 50/0 |  | program
/en/Products/Gas-forklifts/ | yes | medium | 2500 | 2026-10-06T11:28:19.973Z | 200 | 25/0 |  | landing
/en/Products/Hand-Pallet-Trucks/ | yes | medium | 2500 | 2026-10-06T11:28:22.569Z | 200 | 12/0 |  | landing
/en/Products/Heavy-Duty-Forklifts/ | yes | medium | 2500 | 2026-10-06T11:28:54.163Z | 200 | 35/0 |  | landing
/en/Products/IC-Trucks/ | yes | medium | 2500 | 2026-10-06T11:28:56.846Z | 200 | 15/0 |  | program
/en/Products/Order-Pickers/ | yes | medium | 2500 | 2026-10-06T11:28:59.617Z | 200 | 14/0 |  | program
/en/Products/Pallet-Stackers/ | yes | medium | 2500 | 2026-10-06T11:29:30.609Z | 200 | 26/0 |  | landing
/en/Products/Pallet-Trucks/ | yes | medium | 2500 | 2026-10-06T11:29:33.054Z | 200 | 5/0 |  | program
/en/Products/Productfinder/ | yes | medium | 2500 | 2026-10-06T11:29:36.290Z | 200 | 2/0 |  | unique
/en/Products/Reach-Trucks/ | yes | medium | 2500 | 2026-10-06T11:30:07.217Z | 200 | 16/0 |  | program
/en/Products/Tow-Trucks/ | yes | medium | 2500 | 2026-10-06T11:30:09.752Z | 200 | 11/0 |  | program
/en/Products/Tugger-Trains/ | yes | medium | 2500 | 2026-10-06T11:30:13.961Z | 200 | 37/0 |  | landing
/en/Products/Very-Narrow-Aisle-Trucks/ | yes | medium | 2500 | 2026-10-06T11:30:43.694Z | 200 | 11/0 |  | program
/en/Products/ | yes | medium | 2500 | 2026-10-06T11:17:47.380Z | 200 | 17/0 |  | listing
/en/Service/Genuine-Spare-Parts/ | yes | medium | 2500 | 2026-10-06T11:30:46.419Z | 200 | 23/0 |  | landing
/en/Service/Maintenance-Repair/ | yes | medium | 2500 | 2026-10-06T11:30:50.860Z | 200 | 20/0 |  | landing
/en/Service/Retrofit-Accessories/ | yes | medium | 2500 | 2026-10-06T11:31:21.056Z | 200 | 25/0 |  | landing
/en/Service/Technical-Safety-Services/ | yes | medium | 2500 | 2026-10-06T11:31:23.319Z | 200 | 18/0 |  | landing
/en/Service/Training/ | yes | medium | 2500 | 2026-10-06T11:31:26.973Z | 200 | 17/0 |  | program
/en/Service/ | yes | medium | 2500 | 2026-10-06T11:17:47.882Z | 200 | 8/0 |  | listing
/en/Solutions/Consulting/ | yes | medium | 2500 | 2026-10-06T11:31:58.745Z | 200 | 6/0 |  | listing
/en/Solutions/Energy-Systems/ | yes | medium | 2500 | 2026-10-06T11:31:59.887Z | 200 | 39/0 |  | landing
/en/Solutions/Financing/ | yes | medium | 2500 | 2026-10-06T11:32:04.009Z | 200 | 17/0 |  | landing
/en/Solutions/Fleet-Management/ | yes | medium | 2500 | 2026-10-06T11:32:35.870Z | 200 | 20/0 |  | landing
/en/Solutions/Intralogistics-Automation/ | yes | medium | 2500 | 2026-10-06T11:32:37.499Z | 200 | 40/0 |  | landing
/en/Solutions/Overview.html | yes | medium | 2500 | 2026-10-06T11:32:40.048Z | 200 | 7/0 |  | listing
/en/Solutions/Warehouse-Safety/ | yes | slow | 5000 | 2026-10-06T11:58:02.586Z | 200 | 21/0 |  | landing
/en/technical/Location-Finder.html | yes | medium | 2500 | 2026-10-06T11:33:14.010Z | 200 | 2/0 |  | unique
/en/technical/News-Detail_101184.html | yes | medium | 2500 | 2026-10-06T11:33:16.446Z | 200 | 6/0 |  | article
/en/technical/News-Detail_101442.html | yes | medium | 2500 | 2026-10-06T11:33:50.051Z | 200 | 6/0 |  | article
/en/technical/News-Detail_101760.html | yes | medium | 2500 | 2026-10-06T11:33:50.440Z | 200 | 5/0 |  | article
/en/technical/News-Detail_1033728.html | yes | medium | 2500 | 2026-10-06T11:33:53.220Z | 200 | 7/0 |  | article
/en/technical/News-Detail_105280.html | yes | medium | 2500 | 2026-10-06T11:34:26.455Z | 200 | 5/0 |  | article
/en/technical/News-Detail_108480.html | yes | medium | 2500 | 2026-10-06T11:34:26.791Z | 200 | 5/0 |  | article
/en/technical/News-Detail_112000.html | yes | medium | 2500 | 2026-10-06T11:34:29.955Z | 200 | 5/0 |  | article
/en/technical/News-Detail_114368.html | yes | medium | 2500 | 2026-10-06T11:35:03.277Z | 200 | 5/0 |  | article
/en/technical/News-Detail_116352.html | yes | medium | 2500 | 2026-10-06T11:35:03.815Z | 200 | 6/0 |  | article
/en/technical/News-Detail_118656.html | yes | medium | 2500 | 2026-10-06T11:35:06.422Z | 200 | 7/0 |  | article
/en/technical/News-Detail_119232.html | yes | medium | 2500 | 2026-10-06T11:35:39.471Z | 200 | 5/0 |  | article
/en/technical/News-Detail_1254145.html | yes | medium | 2500 | 2026-10-06T11:35:40.632Z | 200 | 5/0 |  | article
/en/technical/News-Detail_1310802.html | yes | medium | 2500 | 2026-10-06T11:35:43.097Z | 200 | 5/0 |  | article
/en/technical/News-Detail_132012.html | yes | medium | 2500 | 2026-10-06T11:36:16.136Z | 200 | 5/0 |  | article
/en/technical/News-Detail_1436407.html | yes | medium | 2500 | 2026-10-06T11:36:17.639Z | 200 | 6/0 |  | article
/en/technical/News-Detail_1445120.html | yes | medium | 2500 | 2026-10-06T11:36:19.624Z | 200 | 6/0 |  | article
/en/technical/News-Detail_1710976.html | yes | medium | 2500 | 2026-10-06T11:36:53.521Z | 200 | 6/0 |  | article
/en/technical/News-Detail_18902.html | yes | medium | 2500 | 2026-10-06T11:36:54.384Z | 200 | 9/0 |  | article
/en/ | yes | slow | 5000 | 2026-10-06T11:56:04.942Z | 200 | 17/0 |  | unique
