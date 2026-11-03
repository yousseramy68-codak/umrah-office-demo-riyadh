# umrah-office-demo-riyadh

Concept preview website (5 static pages, Arabic/English, dark/light) for an Umrah service office in Batha, Riyadh.

**Not the official website of any business and not affiliated with one.** Packages, FAQ answers and any prices are sample content. The hero video is an illustrative animation, not real footage. Pages are `noindex`.

## Pages
`index` · `services` · `about` · `booking` (WhatsApp message builder) · `contact`

## Run locally
```
python3 -m http.server 8000
```
Open http://localhost:8000. No build step, no dependencies.

## Notes
- Fonts (Readex Pro) and the icon subset are bundled in `assets/fonts`.
- Booking form opens `wa.me` with a prepared message; nothing is sent automatically.
- Built by CODAK.
