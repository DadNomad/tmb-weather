# Itinerary data

`route-lookup.json` is the user-supplied version 2 lookup, copied without altering its route or timing entries. It contains 20 combinations: 8–12 days, two directions, and Normal/Faster pace. Every combination has 42 sections grouped into the selected number of days. Counterclockwise starts at Les Houches and finishes in Chamonix; clockwise reverses those endpoints.

Times start at 08:00 local Alpine time. Transport-assisted timing, personal breaks, and transport waits require attention; these are estimates, not walking-only routes or transport schedules.

`forecast-points.json` adds coordinates independently of the supplied lookup. Named landmarks were reviewed against Photon/OpenStreetMap results on October 12, 2026, checking regional bounds, feature type and names. Each entry includes its source URL. Planpraz uses the upper station, Courmayeur the town rather than municipality centroid, and Combal the mapped refuge. Chalets de Plan uses the Plan Varrago waypoint in the linked walking description. This is a weather lookup, not navigation geometry or field validation.

Three points have explicit approximation notes displayed in the app: the Val Ferret balcony (A. Leuchey Sup.), Mont Favre (mapped ridge), and the Issert–Champex forest climb (Issert coordinates, supplied forecast elevation). More precise route geometry can replace these later.

The app requests Open-Meteo Best Match hourly data in batches of eight distinct coordinate/elevation pairs. Each section rounds its start down to the hour unless the next hour is within 15 minutes (inclusive), rounds its end up, and extends to at least two hours. Display and forecast aggregation use the same rounded window. The raw lookup timing is unchanged. Each section uses hourly samples whose one-hour intervals overlap its rounded time window; precipitation totals describe those hourly buckets and are not minute-resolution measurements. Dates outside the returned horizon remain blank. Cache identity includes start date, number of days, direction and pace. Older in-flight responses cannot overwrite a new selection.

Validation: `node tests/regression.cjs` covers all 20 selections, calendar boundaries, short sub-hour windows, units and existing location permission behavior. Browser checks cover selection changes, persistence and weather rendering.
