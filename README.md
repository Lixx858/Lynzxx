# ClipForge v3 Complete

Fitur:
- Dashboard upload video
- AI analysis transcript memakai OpenAI
- halaman Settings
- Test Connection
- API key server-side melalui Environment Variables
- worker FastAPI + Whisper + FFmpeg
- batch clip rendering 9:16

## API key
Jangan taruh API key di source code atau `NEXT_PUBLIC_*`.
Di Vercel: Settings -> Environment Variables:
OPENAI_API_KEY = key kamu
OPENAI_MODEL = gpt-4o-mini

Halaman /settings akan menunjukkan status dan Test Connection. Untuk keamanan, halaman tidak menerima/menyimpan raw key.

## Deploy web
Import repository ke Vercel. Jika repo berisi folder ini sebagai root, gunakan root directory project. `npm install`, `next build`.

Untuk video nyata:
VIDEO_WORKER_URL=https://worker-kamu.example.com

## Worker
Docker:
docker build -t clipforge-worker worker
docker run -p 8000:8000 clipforge-worker

Worker membutuhkan server yang punya CPU/RAM dan FFmpeg. Untuk production gunakan object storage + queue, bukan filesystem container.
