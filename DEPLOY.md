## Railway Backend Deployment

1. Go to railway.app → Login → New Project
2. "Deploy from GitHub repo" → select teamflow repo
3. Set Root Directory: backend
4. Railway auto-detects Node.js

5. Add Environment Variables (Variables tab):
   MONGO_URI = mongodb+srv://uddeshya2015_db_user:Uu1%23Uu1%23@cluster0.laxwp4v.mongodb.net/teamflow?appName=Cluster0
   JWT_SECRET = teamflow_super_secret_jwt_key_2024_minimum_32_chars
   JWT_EXPIRE = 7d
   NODE_ENV = production
   PORT = 5000
   CLIENT_URL = https://VERCEL_URL_HERE (update after Vercel deploy)

6. Deploy → watch logs
7. Must see: "MongoDB Atlas Connected" + "Server running on port 5000"
8. Copy Railway URL: https://xxx.up.railway.app
9. Test: https://xxx.up.railway.app/health → { status:"ok" }

## Vercel Frontend Deployment

1. Go to vercel.com → Login → New Project
2. Import GitHub repo → teamflow
3. Set Root Directory: frontend
4. Framework Preset: Vite
5. Build Command: npm run build
6. Output Directory: dist
7. Add Environment Variable:
   VITE_API_URL = https://YOUR_RAILWAY_URL/api
8. Deploy → get live URL
9. Copy Vercel URL

## After Both Deployed:
- Go to Railway → Variables → update CLIENT_URL = https://YOUR_VERCEL_URL
- Redeploy Railway backend
- Test live: register, login, create project, create task
- Update README.md with live URLs
