# DadNomad weather alpha

First working slice of the hiking planner: real point forecasts, location search, coordinates and optional elevation, 16-day browsing, hourly detail, metric/imperial units, locally saved points, timestamped fallback snapshots and JSON export.

## Open it

Published path: `https://dadnomad.github.io/tmb-weather/weather-lab/`

Locally, serve this folder with any static web server and open `/weather-lab/`. There are no packages to install or API keys to configure. Internet is required for new forecasts. Snapshot fallback works if the page is already open; a fully offline app launch is not implemented.

## What the pieces mean

- HTML describes the screen's content.
- CSS sets its layout, colours and mobile appearance.
- JavaScript handles clicks and requests forecasts.
- API means a service the app asks for data. Open-Meteo supplies weather; its geocoding service supplies place matches.
- GitHub stores version history. GitHub Pages serves the files as a website.
- MVP means minimum viable product: a small usable release to test before adding more.

## Test your first release

1. Search Chamonix and select the French result.
2. Choose tomorrow. Select other forecast days and inspect hourly detail.
3. Change Celsius to Fahrenheit and check values and labels change together.
4. Select a date two months away: expect "Forecast not yet available".
5. Enter a trail point's known coordinates and optional elevation; save it.
6. Reload and select your saved point. Saved points stay in this browser only.
7. After loading a forecast, disconnect the network and refresh within the open page. A saved snapshot must be marked with its timestamp.

## Scope and next steps

This is an intentionally small static prototype for fast testing, not the full Next.js/Firebase architecture in the product specification. No AI, sign-in, billing, route geometry, official alerts or automatic whole-route forecast sampling is included. A town forecast must not be interpreted as an entire mountain route's conditions.

Next: collect feedback, introduce separate weather/domain/UI modules with React and TypeScript, add GPX start/high-point/end sampling, then dated trips and authenticated cloud storage. Preserve timestamp and unavailable-value handling throughout.

Weather documentation: https://open-meteo.com/en/docs. Free endpoint intended for non-commercial evaluation; revisit service terms before commercial launch.