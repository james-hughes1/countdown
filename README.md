# Countdown

A simple, configurable countdown web app. No dependencies — just Node.js (18+) and a browser.

## Quick start

```sh
npm start          # serves the app at http://localhost:8080
PORT=3000 npm start  # use a different port
npm test           # run the unit tests
```

## Configuration

Edit `config.json` at the project root, then refresh the page (no restart needed).

```json
{
  "title": "New Year 2027",
  "endDate": "2027-01-01T00:00:00",
  "completedMessage": "Happy New Year!",
  "units": ["days", "hours", "minutes", "seconds"],
  "theme": {
    "background": "#0f172a",
    "text": "#e2e8f0",
    "accent": "#38bdf8"
  }
}
```

| Option             | Required | Default                                  | Description |
| ------------------ | -------- | ---------------------------------------- | ----------- |
| `endDate`          | yes      | —                                        | ISO 8601 date-time to count down to (see below). |
| `title`            | no       | `"Countdown"`                            | Heading and browser tab title. |
| `completedMessage` | no       | `"Time's up!"`                           | Shown when the countdown reaches zero. |
| `units`            | no       | `["days", "hours", "minutes", "seconds"]` | Which units to show. Omitted units roll into the next larger one (e.g. without `days`, hours can exceed 23). |
| `theme`            | no       | dark blue theme                          | Any CSS colors for `background`, `text` and `accent`. |

### Time zones

- `"2027-01-01T00:00:00"` (no offset) — midnight in **each viewer's local time**. Good for things like New Year.
- `"2027-01-01T00:00:00Z"` or `"2027-01-01T00:00:00-05:00"` — a single **fixed moment** for everyone.

Date-only values like `"2027-01-01"` are rejected, because JavaScript would silently treat them as UTC.

If the config is invalid, the page lists every problem so you can fix them all at once.

## Project layout

```
config.json            your settings
server.js              tiny static file server (serves public/ + config.json)
public/
  index.html
  styles.css
  js/
    main.js            browser entry point (DOM + timer loop)
    countdown.js       pure time calculation logic
    config.js          config validation and defaults
tests/                 unit tests (node:test)
```

The logic in `countdown.js` and `config.js` doesn't touch the DOM, so it's unit tested directly in Node.
