# Moving Roibos Labs to its own domain

Labs currently lives at `leongrimmeisen.de/labs/`. It was built to be lifted out with as
little edit surface as possible. This is what that move involves.

## 1. What has to come with it

| Source | Why |
|---|---|
| `labs/` | the site itself |
| `assets/css/tokens.css` | `labs.css` overrides these tokens, it does not define them |
| `assets/img/AppStoreIcons/` | app icons |
| `assets/img/logos/lid_logo.png` | Leben in Deutschland's icon lives here, not in AppStoreIcons |
| `assets/facivons/the_horns.png` | favicon |
| `projects/<App>/` | the individual app pages Labs links to |

## 2. Path rewrites

Every internal link in `labs/` is relative and assumes Labs sits one level below the
repo root. Once `labs/index.html` becomes the *root* of its own site, the `../` prefix
has to go:

```
../assets/       →  assets/
../projects/     →  apps/          (or wherever the app pages land)
../index.html    →  https://leongrimmeisen.de/   (the back-link leaves the site)
```

That is the whole change — a find-and-replace plus one absolute URL.

## 3. The part that is not a find-and-replace

**The app pages under `projects/<App>/` are registered with Apple.** Each app's
privacy-policy URL is on file in App Store Connect, e.g.

```
https://leongrimmeisen.de/projects/Chronicles/privacy-policy.html
```

If those URLs move and nothing serves the old path, the listings point at a 404. So the
move is a three-step sequence, in this order:

1. Stand the new domain up with the app pages live at their new URLs.
2. Update the privacy-policy and support URLs for **all seven apps** in App Store
   Connect. (Metadata-only edits — no new build or review required.)
3. Only then, leave redirect stubs at the old `leongrimmeisen.de/projects/*` paths.
   GitHub Pages cannot serve a 301, so a stub is `<link rel="canonical">` plus
   `<meta http-equiv="refresh">` plus a visible link for anyone whose browser ignores
   both.

Keep the stubs indefinitely. They cost nothing and old App Store review notes,
screenshots and support emails will reference the old URLs for years.

## 4. Roster at time of writing

| App | App Store ID | Page |
|---|---|---|
| Chronicles | `6780227585` | `projects/Chronicles/` |
| Tick | `6757186751` | `projects/Tick/` |
| Doomsday Method | `6447447000` | `projects/DoomsdayMethod/` |
| Leben in Deutschland Pro | `6759523195` | `projects/LebenInDeutschland/` |
| Busfahrer Partyspiel | `6758355578` | `projects/Busfahrer/` |
| WorkoutPulse | `6444348524` | `projects/WorkoutPulse/` |
| Health Pulse | `6497484745` | `projects/HealthPulse/` |

`projects/JustTabata/` is the pre-rename page for WorkoutPulse — same app, same ID
(`6444348524`). It is delisted from the site but the folder stays, because its legal URLs
may still be referenced. Do not delete it.
