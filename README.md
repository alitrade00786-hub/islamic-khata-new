# Islamic Khata — PWA Starter

A complete mobile-first Islamic Khata web app prototype with:
- Login / Signup / Forgot Password UI
- Dashboard summary
- Member search/add/edit
- Payment recording with automatic month calculation
- Paid-until calculation and automatic expiry
- Payment history
- Call / WhatsApp / SMS actions
- Settings and logout
- PWA install support
- Local browser database using localStorage
- Firebase-ready architecture

## Run locally
You need Node.js 18+.

```bash
npm install
npm run dev
```

Then open the local address shown by Vite.

## Build
```bash
npm run build
npm run preview
```

## Important for real cloud login/database
This project works immediately in DEMO/local mode. For production multi-user cloud data, create a Firebase project and put its web config in `src/firebase.js`.

The UI and data layer are intentionally separated so Firebase can replace the local repository without redesigning the app.

## Android
The project includes Capacitor configuration. After installing Node.js:
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
Then build the APK from Android Studio.

## Security
For production, never trust client-side ownership checks alone. Use Firebase Authentication and Firestore Security Rules so each owner can only read/write their own records.
