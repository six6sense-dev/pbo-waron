# PBO Waron Hospital

Aplikasi portal login dan dashboard medis profesional untuk perhitungan PBO yang menggunakan Google Sheets dan Google Drive sebagai database.

## Fitur Utama

- Portal login user medis
- Dashboard statistik tindakan dan tarif
- Perhitungan estimasi PBO berbasis data spreadsheet
- Sinkronisasi dokumen terbaru dari Google Drive
- Siap deploy ke Vercel (frontend + serverless API)

## Teknologi

- React + Vite
- Vercel Serverless Functions
- Google Sheets API
- Google Drive API

## Konfigurasi Environment

Buat file `.env.local` berdasarkan contoh di bawah:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=1rtb8gYm-6CzgqSiTdWbgwl6tKoJf_NqpV9mqciXsI8U
GOOGLE_DRIVE_FOLDER_ID=
JWT_SECRET=ganti-dengan-random-string-yang-kuat
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
```

## Prasyarat Google

1. Buat Service Account di Google Cloud.
2. Aktifkan Google Sheets API dan Google Drive API.
3. Share spreadsheet ke email service account sebagai Viewer.
4. Jika memakai Drive folder, share folder ke service account sebagai Viewer.

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka: `http://localhost:5173`

## Struktur Endpoint API

- `POST /api/login` validasi user dari Google Sheets
- `GET /api/bootstrap` ambil semua data dashboard dari Sheets + Drive
- `POST /api/calculate` hitung estimasi PBO
- `GET /api/health` status service

## Deploy ke Vercel

```bash
npm run build
npx vercel --prod
```

Set semua environment variable di Project Settings Vercel sebelum deploy produksi.

## Catatan Penting

- Spreadsheet harus bisa diakses service account.
- Bila struktur kolom berubah, endpoint tetap mencoba normalisasi otomatis dari header.
- Login fallback admin dipakai jika sheet user belum tersedia.
