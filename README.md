# HealthPlate

Restaurant discovery filtered by **health condition**, not just cuisine or price.

Apps like Zomato and Swiggy only offer veg/non-veg. HealthPlate lets someone
managing diabetes, hypertension, coeliac disease or a nut allergy filter a whole
city's restaurants down to the dishes they can actually eat.

## What it does

- **JWT auth** with a saved health profile (conditions + allergies)
- **Restaurant listing** with real haversine distance, cuisine, price and rating
- **Dish tagging** — any logged-in user can add a dish with health tags and allergens
- **Safe for me** — one tap filters everything to your saved profile
- **Health condition filter bar** — manual multi-select, independent of the profile
- **Community voting** — upvote/downvote whether a dish's tags are accurate,
  with a confidence score that sorts results
- **Dish detail** — tags, allergens, vote counts and an editable ordering tip

## Stack

| Layer    | Tech                                  |
| -------- | ------------------------------------- |
| Frontend | React 18 + Vite + Tailwind CSS        |
| Backend  | Node.js + Express                     |
| Database | MongoDB via Mongoose                  |
| External | Google Places API (optional)          |
| Deploy   | Vercel (frontend) + Render (backend)  |

## Quick start

Two terminals.

```bash
# 1. Backend
cd backend
npm install
npm run seed     # 30 restaurants + 150 dishes
npm run dev      # http://localhost:5000

# 2. Frontend
cd frontend
npm install
npm run dev      # http://localhost:5173
```

No `.env` is required for local development. With `MONGODB_URI` empty the backend
starts an in-memory MongoDB automatically, so a fresh clone runs with zero setup.

**Demo login:** `demo@healthplate.app` / `demo1234`

### One caveat about the in-memory database

The fallback database lives inside the server process and is discarded when it
exits. That means `npm run seed` and `npm run dev` must run **in the same
process** to share data. Two options:

- **Quickest demo** — start the server with a single command that seeds and serves:
  ```bash
  cd backend
  npm run dev:seed
  ```
- **Persistent** — set `MONGODB_URI` to a free MongoDB Atlas cluster and run
  `npm run seed` once. Data survives restarts, which is what you want on Render.

## Environment variables

Copy `backend/.env.example` to `backend/.env`. Every value has a working default
except `JWT_SECRET`, which must be changed in production (the server refuses to
boot with the default value when `NODE_ENV=production`).

| Variable                | Default                  | Purpose                                             |
| ----------------------- | ------------------------ | --------------------------------------------------- |
| `PORT`                  | `5000`                   | API port                                            |
| `MONGODB_URI`           | _(empty)_                | Atlas URI. Empty means in-memory fallback           |
| `JWT_SECRET`            | `dev-only-change-me`     | Token signing secret. **Change in production**      |
| `JWT_EXPIRES_IN`        | `7d`                     | Token lifetime                                      |
| `CLIENT_URL`            | `http://localhost:5173`  | Comma-separated CORS origins                        |
| `GOOGLE_PLACES_API_KEY` | _(empty)_                | Optional. Empty means seeded restaurants only       |
| `DEFAULT_LAT`/`_LNG`    | Andheri West, Mumbai     | Fallback map centre when geolocation is unavailable  |

## Google Places

Optional by design. The app is fully functional without it, which is what makes
the demo reliable.

With a key set, `POST /api/restaurants/search-nearby` calls the Places Text Search
API, upserts the results into Mongo, and serves them alongside seeded data. Health
tags are never inferred from Google data — the community supplies those.

## Location handling

The frontend asks the browser for geolocation and silently falls back to the
configured demo centre when permission is denied or ignored. The UI always states
which origin it is using, so the fallback is visible rather than a mystery.

## API reference

### Auth
```
POST   /api/auth/signup        { name, email, password, dietary_preferences[], allergies[] }
POST   /api/auth/login         { email, password }
GET    /api/auth/me
PATCH  /api/auth/me            { name?, dietary_preferences[]?, allergies[]? }
GET    /api/auth/config        health tag + allergen enums
```

### Restaurants
```
GET    /api/restaurants
       ?health_tags=diabetic_friendly,gluten_free
       &exclude_tags=low_oil
       &avoid_allergens=dairy,nuts
       &cuisine=North%20Indian
       &price=$,$$
       &search=biryani
       &radius_km=5
       &sort=distance|rating|price_asc|price_desc|name
       &safe_for_me=true
       &lat=19.1197&lng=72.8464
       &limit=50&page=1
GET    /api/restaurants/:id
GET    /api/restaurants/meta/filters
POST   /api/restaurants/search-nearby   { query }
```

`safe_for_me=true` with a valid token requires dishes to carry **every** saved
dietary preference and **none** of the saved allergens. Anonymous requests fall
back to the manual filters rather than failing.

### Dishes
```
GET    /api/dishes  ?health_tags=&search=&sort=confidence|most_voted|newest|name&restaurant_id=
GET    /api/dishes/:id
POST   /api/dishes           { name, restaurant_id, health_tags[], allergens[], tip?, description? }
PATCH  /api/dishes/:id       { health_tags[]?, allergens[]?, tip?, name? }
POST   /api/dishes/:id/vote  { direction: 'up' | 'down' }
```

Voting is one-per-user, self-retracting, and flippable. Repeating the same
direction removes your vote.

## Testing

```bash
cd backend
npm run smoke    # 36 API checks incl. auth, filters, voting, authorization
npm run verify   # 18 live HTTP checks against the real response shapes
```

Both spin up an in-memory database, so neither needs external services.

## Data model notes

**Vote confidence** is `(up - down) / (total + 5)`. The Bayesian prior means a
dish with one upvote cannot outrank a dish with forty votes at the same ratio, so
low-vote contributions stay below well-corroborated ones.

**Seed data** deliberately includes 51 untagged dishes. Those are the "no match"
cases that make filters visibly exclude something rather than matching everything.

## Out of scope

Marked as TODOs in the code, not implemented:

- AI-based auto-tagging from ingredient lists
- Real-time menu sync from restaurants
- Payment and ordering

## Deploying

**Backend → Render**

1. New Web Service, connect this repo, root directory `backend`
2. Build `npm install`, start `npm start`
3. Set `JWT_SECRET` (auto-generated), `MONGODB_URI` (Atlas free tier),
   `CLIENT_URL` (your Vercel domain)
4. Run `npm run seed` once against the same Atlas cluster

`render.yaml` is included if you prefer blueprint deploys.

**Frontend → Vercel**

1. New Project, root directory `frontend`, framework preset Vite
2. Set `VITE_API_URL` to your Render URL (no trailing slash)
3. `vercel.json` already handles SPA rewrites so deep links like
   `/restaurants/:id` resolve on refresh
