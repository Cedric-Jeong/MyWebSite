# 🌿 소보로 일기 — 풀스택 설치 가이드

AI 요약 기능이 포함된 개인 성장 일기 플랫폼입니다.

---

## 📁 폴더 구조

```
cedric-backend/          ← 백엔드
  ├── server.js
  ├── package.json
  └── .env               ← 직접 생성 필요

cedric-frontend/         ← 프론트엔드 (별도 폴더)
  └── src/
      └── App.jsx
```

---

## ⚙️ 1단계 — 백엔드 설치 및 실행

```bash
# 백엔드 폴더로 이동
cd soboro-journal

# 패키지 설치
npm install

# .env 파일 생성
cp .env.example .env
```

`.env` 파일을 열고 실제 API 키 입력:
```
GEMINI_API_KEY=여기에_실제_키_입력
PORT=4000
```

> 🔑 Gemini API 키 발급: https://makersuite.google.com/app/apikey

```bash
# 서버 실행 (개발 모드)
npm run dev

# 또는 일반 실행
npm start
```

✅ 터미널에 `소보로 서버 실행 중: http://localhost:4000` 출력되면 성공

---

## ⚙️ 2단계 — 프론트엔드 설치 및 실행

```bash
# React 앱 생성 (처음 한 번만)
npx create-react-app soboro-frontend
cd soboro-frontend

# App.jsx 교체
# src/App.jsx 파일을 제공된 코드로 교체하세요

# 실행
npm start
```

브라우저에서 http://localhost:3000 열기

---

## 🧪 API 직접 테스트 (선택사항)

```bash
curl -X POST http://localhost:4000/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "오늘 하루도 수고했다. 힘들었지만 버텼다."}'
```

---

## 🔌 API 엔드포인트 정리

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /health | 서버 상태 확인 |
| POST | /summarize | 개인 생각 AI 요약 |
| POST | /summarize-visitors | 방문자 메시지 일괄 요약 |

---

## 🚀 나중에 확장하는 방법

### MongoDB 연동 (생각 저장)

```bash
npm install mongoose
```

`server.js`에 추가:
```js
const mongoose = require('mongoose');
await mongoose.connect(process.env.MONGODB_URI);

const ThoughtSchema = new mongoose.Schema({
  text: String,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});
const Thought = mongoose.model('Thought', ThoughtSchema);

// POST /thoughts — 저장
app.post('/thoughts', async (req, res) => {
  const thought = new Thought(req.body);
  await thought.save();
  res.json(thought);
});

// GET /thoughts — 목록 조회
app.get('/thoughts', async (req, res) => {
  const thoughts = await Thought.find().sort({ createdAt: -1 });
  res.json(thoughts);
});
```

### Firebase Firestore 연동

```bash
npm install firebase-admin
```

```js
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

// 저장
await db.collection('thoughts').add({ text, summary, createdAt: new Date() });

// 조회
const snap = await db.collection('thoughts').orderBy('createdAt', 'desc').get();
const thoughts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

---

## ❓ 자주 발생하는 오류

| 오류 메시지 | 해결 방법 |
|-------------|-----------|
| `GEMINI_API_KEY가 없습니다` | .env 파일에 키 입력했는지 확인 |
| `CORS 오류` | 백엔드가 포트 4000에서 실행 중인지 확인 |
| `fetch failed` | 백엔드 서버가 켜져 있는지 확인 |
| `400 Bad Request` | 텍스트가 너무 짧으면 발생 (10자 이상 필요) |
