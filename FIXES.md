# Zomato-mern — Fixes applied

## 1. Server boot crash (sabse bada bug)
`src/services/storage.services.js` mein ImageKit module load hote hi initialise ho raha tha.
Agar `IMAGEKIT_*` env vars deploy pe missing hue, to `require` chain ke through **pura server start hone se pehle hi crash** ho jaata tha.
Ab ImageKit lazy-init hota hai — upload karte waqt hi banta hai, aur missing config par saaf error deta hai.

## 2. Login/cookie deploy pe kaam nahi karta
Cookie bina options ke set ho rahi thi:
```js
res.cookie("token", token)   // default: sameSite=Lax, secure=false, httpOnly=false
```
Frontend aur backend alag domain (`*.onrender.com`) pe hain = cross-site.
Browser aisi cookie **na set karta hai na bhejta hai** → har protected API 401.

Ab:
```js
{ httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", maxAge: 7d, path: "/" }
```
`res.clearCookie` bhi same options ke saath — warna logout kaam nahi karta.
`app.set('trust proxy', 1)` add kiya, warna Render ke proxy ke peeche `secure` cookie drop hoti hai.

## 3. Hardcoded port
`app.listen(3000)` → `process.env.PORT || 3000`.
Render apna PORT deta hai; 3000 pe bind karne se "No open ports detected" aata hai.

## 4. Missing start script
`package.json` mein na `start` tha, na `main` sahi tha. Render / `npm start` fail hota tha.
Ab: `start: node server.js`, `dev: node --watch server.js`.

## 5. DB connect fail hone par bhi server chalta rehta tha
`db.js` error ko sirf `console.log` karke nigal jaata tha. Server up dikhta tha par har query
mongoose buffering timeout se 500 deti thi. Ab connect fail hone par process exit hota hai
(Render logs mein asli reason dikhega), aur `MONGODB_URI` missing ho to clear error.

## 6. CORS 500
```js
/\.onrender\.com$/.test(new URL(origin).hostname)
```
Invalid origin string par `new URL()` **throw** karta tha → 500.
Ab try/catch ke saath, `FRONTEND_URL`, localhost 5173/4173, `*.onrender.com`, `*.vercel.app` allowed.

## 7. JWT expiry nahi tha
Token kabhi expire nahi hota tha. Ab `expiresIn: "7d"` + `jwt_SECRET` missing hone par clear error.

## 8. SPA deep-link 404
React Router ke saath static host pe `/user/login` refresh karne pe 404 aata tha.
`frontend/public/_redirects` aur `frontend/vercel.json` add kiye (catch-all → index.html).

## 9. 404 handler
Unknown route par ab JSON 404 milta hai, HTML error page nahi.

---

# Deploy checklist

## Backend (Render → Web Service)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables:
  - `NODE_ENV=production`   ← ye **zaroori** hai, warna cookie secure/none nahi lagegi
  - `FRONTEND_URL=https://<tumhara-frontend>.onrender.com`
  - `jwt_SECRET=...`
  - `MONGODB_URI=...`
  - `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINT`
- MongoDB Atlas → Network Access → `0.0.0.0/0` allow karo (Render ka IP fixed nahi hota).

## Frontend (Render → Static Site)
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Env: `VITE_API_URL=https://<tumhara-backend>.onrender.com`

## Local
```bash
cd backend  && npm install && npm run dev
cd frontend && npm install && npm run dev
```

---

# Baaki dhyan dene layak

- **node_modules commit mat karo.** Zip mein Windows ke native binaries the (`rolldown-binding`),
  jo Linux pe chalte hi nahi. Deploy host pe hamesha fresh `npm install` hona chahiye.
- `backend/.env` git mein track nahi hai (sahi hai), par zip mein asli secrets aa gaye the.
  Agar wo zip kahin share hua ho to **jwt_SECRET, MongoDB password aur ImageKit private key rotate kar do.**
- Video upload par koi size limit nahi hai (`multer` memoryStorage). Bada file Render ke free
  instance ki RAM kha jaayega. `multer({ limits: { fileSize: 25 * 1024 * 1024 } })` add karna chahiye.
