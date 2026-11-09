# EVENT/OS — Event Management Front End (Version 4)

A responsive, framework-free event management website with two **visually distinct** interfaces: an administrator workspace and a member-facing event discovery website. Version 4 adds three-field account registration without changing either dashboard layout. 

## Open

1. Extract the ZIP.
2. Open `index.html` in Chrome or Edge.
3. Sign in using either demo account, or choose **Sign up** to create your own User account.

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Event@2026` |
| User | `user` | `User@2026` |

## Sign Up

The Sign Up page matches the existing centered Login design. It asks for only **Username, Password, and Confirm Password**. Username must contain 3–20 letters, numbers, or underscores; password must contain at least 8 characters. Empty fields, mismatched passwords, and reused usernames receive visible validation messages. Password and Confirm Password each have their own show/hide eye icon.

When registration succeeds, the browser returns to Login with a success message. New accounts always have the **User** role, and their tickets are kept separate from those of other users. Each user account has its own linked participant record; because no email is collected at signup, the internal participant record's email is blank.

## What each role sees

**Administrator:** The original admin dashboard, events, participants, registrations, schedules, and complete CRUD actions. Includes record selection, add/edit forms, details, delete confirmations, field validation, success/error messages, filters, and logout confirmation.

**User:** A separate website-style layout with horizontal navigation, featured event, event discovery cards, search and category filtering, event detail modals, registration confirmation, ticket-style registration management, cancellation confirmation, and an event agenda. On mobile, the header has a collapsible menu. User routes do not expose administrator modules.

The user site is not a repainted copy of the admin dashboard; it has its own navigation, content hierarchy, page templates, colors, and card system. Event posters are rendered entirely in CSS, so the website works without external image hosting.

## Demo functionality

Both built-in accounts, new signups, and all CRUD/event registration operations work locally. Session state is stored using `sessionStorage`. Shared event records and newly created accounts are stored using `localStorage` in the same browser. They persist when you refresh unless browser data is cleared. Data and accounts do not synchronize across browsers or devices.

**Demo-only security:** New-account passwords are stored in browser storage as plain text for local testing. **Do not use real passwords or deploy this as a production authentication system.** Production integration must replace the demo credential storage and client-only role checks with server-side account creation, password hashing, login/session verification, authorization, and protected database APIs. **The front-end interface contains no backend warning banners.**

Google Fonts provides Anton (display), DM Sans (body), and JetBrains Mono (metadata). System font fallbacks are provided for offline use.

## Files

- `index.html` — app entry point
- `assets/css/styles.css` — admin/login styles and separate visitor styles
- `assets/js/data.js` — local demo records, relations, and validation
- `assets/js/app.js` — rendering, navigation, authentication demo, and interactions
- `tests/frontend.robot` — 50 SeleniumLibrary / Robot Framework scenarios using CSS and XPath
- `previews/` — separate browser-captured preview images (not official Robot screenshot evidence)

## Run Robot tests

Install Python and Google Chrome, then in the extracted folder:

```bash
pip install robotframework robotframework-seleniumlibrary
python -m http.server 5500
```

In another terminal, run:

```bash
robot -d results tests/frontend.robot
```

Robot screenshots, `log.html`, and `report.html` are generated during test execution. The supplied Robot suite has **not** been run in this environment; browser interaction checks were performed separately using Chromium/Playwright. The checks covered signup input validation, duplicate username rejection, independent password-eye controls, new-account login, per-user registration isolation, admin regression, and signup overflow at 320–1440px. The v3 browser test coverage was performed during the previous development round.

## Version 4 changes

- Login page now links to Sign Up; Sign Up links back to Login.
- Added local User account creation and duplicate-username checks (case-insensitive).
- New users can log in and manage only their own event tickets.
- Added nine signup and account-isolation scenarios to the Robot test suite.
- Updated screenshots in `previews/signup-v4.png` and `previews/signup-mobile-v4.png`. These are design previews, not official Robot test evidence.
