## Railway Backend Deployment

1. Go to [Railway.app](https://railway.app) → Login → New Project
2. "Deploy from GitHub repo" → select the **Hit-List** repo
3. Set Root Directory: `backend`
4. Railway auto-detects Node.js

5. Add Environment Variables (Variables tab):
   MONGO_URI = <YOUR_MONGODB_URI_HERE>
   JWT_SECRET = <YOUR_SECURE_JWT_SECRET_HERE>
   JWT_EXPIRE = 7d
   NODE_ENV = production
   PORT = 5000
   CLIENT_URL = https://hit-list-snowy.vercel.app

6. Deploy → watch logs
7. Must see: "MongoDB Atlas Connected" + "Server running on port 5000"
8. Your Railway URL is: https://hit-list-production.up.railway.app
9. Test: https://hit-list-production.up.railway.app/health → `{ status:"ok" }`

---

## Vercel Frontend Deployment

1. Go to [Vercel.com](https://vercel.com) → Login → New Project
2. Import GitHub repo → **Hit-List**
3. Set Root Directory: `frontend`
4. Framework Preset: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add Environment Variable:
   VITE_API_URL = https://hit-list-production.up.railway.app/api
8. Deploy → get live URL
9. Your Vercel URL is: https://hit-list-snowy.vercel.app

---

## After Both Deployed:
- Go to Railway → Variables → ensure `CLIENT_URL` matches your Vercel URL.
- Redeploy Railway backend if you made changes to the variables.
- Test live: register, login, create project, create task.
- Update `README.md` with live URLs.