# FITCONNECT — Home Workout & Virtual Trainer

A responsive front-end prototype built with HTML5, CSS3, and vanilla JavaScript. It uses browser LocalStorage for demo persistence and is structured so a backend API can be added later.

## Run the project

1. Extract `FITCONNECT.zip`.
2. Open the `FITCONNECT` folder in Visual Studio Code.
3. Open `index.html` in a browser, or use the VS Code **Live Server** extension.
4. Use one of the demo accounts below.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Fitness User | user@fitconnect.demo | demo123 |
| Trainer / Coach | trainer@fitconnect.demo | demo123 |
| Administrator | admin@fitconnect.demo | demo123 |

You can also create a new Fitness User account from the registration tab.

## Included prototype features

- Login, registration, basic validation, demo password visibility toggle, and role-based navigation
- Fitness User training dashboard, weekly goal, workout categories, challenges, workout search and filters
- Workout details, timed exercise player, pause/resume, next exercise, completion summary, and workout history
- Trainer marketplace and trainer profile previews
- Configurable FREE, PREMIUM, and PRO subscription plans with simulated checkout, expiry handling, and feature gates
- Health screening warning flow
- Progress report, weight logging, BMI calculator, and activity summaries
- Settings, reminders/sound/voice preference toggles, notification center, and logout
- Trainer workspace with dashboard statistics and earnings/client-growth/workout-progress visuals
- Client CRUD, profile and workout history, activation, subscription status, progress assessments, and personalized plan assignments
- Workout-plan CRUD with weekly schedules, exercise sets/reps/duration/rest, instructions, and optional video links
- Training calendar with appointment requests, scheduling, reminders, status updates, and attendance recorded through completed sessions
- Client progress charts, weight/BMI estimates, completion metrics, trainer notes, and optional before/after image links
- Local sample earnings, subscription status, pending payments, and payment history (no real payment processing)
- Per-client local messaging, workout reminders, and announcements
- Clearly labeled rule-based workout suggestions, progress analysis, and missed-workout follow-ups (no external AI model)
- Trainer profile, availability, certifications, specializations, local preferences, and demo password changes
- Admin dashboard with user, trainer, plan, subscription, and simulated payment management
- Role controls for all demo accounts, with a safeguard against removing the active administrator's own access
- Admin announcements, printable reports, activity logs, account settings, and profile management
- Subscription entitlements that gate workout library access, reports, and trainer coaching in the browser
- Deactivated, archived, or suspended demo accounts are blocked from login; admin registration controls are applied locally
- Responsive layout designed for common mobile widths

## Important limitations

This is a front-end prototype, not a production-ready service. LocalStorage is used only to demonstrate local persistence. Do not store real passwords, payment credentials, or sensitive health information in browser storage. Demo login credentials are intentionally visible in this source project.

The payment flow is simulated; no money is collected, and withdrawals are not supported. Admin-created announcements, system settings, subscription events, and activity logs are stored only in this browser; announcement delivery and automated billing are not connected. Trainer messages and reminders are local-only; profile pictures and progress images use public image URLs instead of uploads. Live chat/notifications, secure authentication and password recovery, payment processing, video coaching, and server-enforced administrator or subscription permissions require production services. Subscription gates in this prototype can be bypassed by modifying browser data and are not security controls. Workout suggestions and progress recommendations are rule-based demonstrations, not AI or medical advice. BMI is informational only and is not a diagnosis.

No database is required to run this version. The app uses a small storage abstraction (`js/storage.js`) and can later connect to any backend through REST API calls without committing to a particular database.

## Project structure

```text
FITCONNECT/
├── index.html
├── README.md
├── css/
│   ├── style.css
│   ├── responsive.css
│   ├── trainer.css
│   └── admin.css
└── js/
    ├── app.js
    ├── data.js
    ├── storage.js
    ├── trainer.js
    └── admin.js
```

## Customization

- Update sample workouts and trainers in `js/data.js`.
- Adjust branding and colors in `css/style.css`.
- Replace remote sample image URLs with your own licensed assets in `js/data.js`.
- Add API calls in a separate service module when your backend is ready.
