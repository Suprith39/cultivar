# Cultivar — Agricultural Supply Chain Traceability

## Railway Deployment

Deploy 3 separate services on Railway from this repo:

### 1. Backend (Node.js)
- Root directory: `server`
- Build: `npm install`
- Start: `node index.js`
- Environment variables:
  ```
  PORT=5000
  JWT_SECRET=your_secret
  DATABASE_URL=postgresql://...
  ```

### 2. Frontend (React)
- Root directory: `client`
- Build: `npm install && npm run build`
- Start: `npx serve -s build -l $PORT`
- Environment variables:
  ```
  REACT_APP_API_URL=https://your-backend.railway.app
  ```

### 3. AI Service (Python/Flask)
- Root directory: `ai-service`
- Build: `pip install -r requirements.txt`
- Start: `python app.py`

## Local Development

```bash
# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm start

# AI Service
cd ai-service && pip install -r requirements.txt && python app.py
```

## Environment Variables (server/.env)
```
PORT=5000
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://user:password@host:5432/dbname
```
