
## 🎬 CineCloud: Watchlist & Reflection App

**CineCloud** is a mobile app built with **React Native (Expo Go)** that lets users track, reflect on, and share their favorite **movies, shows, and series**. With Firebase authentication, Firestore-powered data storage, and a cinematic UI, CineCloud transforms your watch history into a personalized, interactive experience.

---

### 🚀 Tech Stack

| Layer        | Technology Used                     | Notes |
|--------------|-------------------------------------|-------|
| **Frontend** | React Native (Expo Go)              | No native modules, fast prototyping |
| **Routing**  | `expo-router` (optional)            | File-based routing or manual navigation |
| **Backend**  | Firebase Authentication             | Email/password or social login |
| **Database** | Firestore (Cloud Firestore)         | NoSQL, real-time sync |
| **Storage**  | Firebase Storage (optional)         | For posters, screenshots, etc. |
| **Dev Tools**| Git, VS Code, Expo CLI              | CI/CD optional via EAS |

---

### 📁 Folder Structure

```
CineCloud/
├── assets/                     # Fonts, images, icons
├── components/                 # Reusable UI components
│   ├── CustomTabBar.js
│   ├── MovieCard.js
│   └── SearchBar.js
├── node_modules/              # Dependencies
├── output/                    # Build or export artifacts
├── screens/                   # App screens
│   ├── admin/                 # Admin-specific views
│   ├── DiscoverScreen.js
│   ├── FavouritesScreen.js
│   ├── GenrePreferencesScreen.js
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   ├── ProfileScreen.js
│   ├── SearchandExplore.js
│   ├── SignUpScreen.js
│   ├── SimpleSearchScreen.js
│   ├── StartScreen.js
│   ├── TrailerPlayerScreen.js
│   ├── VIPScreen.js
│   └── WelcomeScreen.js
├── .env                       # Firebase config (never commit this!)
├── app.json                   # Expo config
└── README.md                  # Project documentation
```

---

### 🔐 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password or Google)
3. Enable **Firestore Database**
4. Add your Firebase config to `.env`:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

---

### ✨ Features

- 🎞️ Discover screen with carousel of watched content
- 🎯 Genre-based filtering and smooth scroll animations
- 📝 VIP blog post creation with fade-in transitions
- 📖 Tap-to-expand modal with title, cast, rating, platform badge, and personal notes
- 🔐 Firebase Authentication (login/signup)
- ☁️ Firestore for storing user reflections and watchlist data
- 🔍 Search and Explore with custom filters
- 🎥 Trailer playback via embedded player

---

### 🧪 Testing & Debugging

- Use `expo start` for local development
- Firebase errors logged via `console.error`
- Modular components and screens for clean debugging
- Git hygiene: clear commits, branch naming, `.env` excluded

---

### 🛠️ Scripts

```bash
# Start Expo
npm start

# Install dependencies
npm install

# Firebase setup
npm install firebase

# Optional: Expo Router setup
npm install expo-router react-native-safe-area-context react-native-screens
```

---

### 👥 Team Onboarding Checklist

- [ ] Clone repo and run `npm install`
- [ ] Add `.env` with Firebase config
- [ ] Test login/signup flow
- [ ] Explore Discover and VIP screens
- [ ] Follow commit message conventions
- [ ] Use modular components and screens for scalability

---

### 🎨 UI/UX Highlights

- Fonts: Pacifico, Grance
- Themes: Pastel gradients, cinematic scroll
- Posters: Pulled from OMDB or uploaded via Firebase Storage
- Animations: Fade-in/out, scale on tap, smooth transitions


Would you like me to scaffold your `firebase.js` and `firestore.js` service files next, or generate a printable onboarding checklist for your team?
