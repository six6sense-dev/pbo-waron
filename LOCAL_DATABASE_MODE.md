# 📁 Local Database Mode - Tanpa Google Cloud!

## Apa yang Baru?

Sekarang sistem PBO mendukung **2 mode database**:

✅ **Mode Lokal** (BARU) - Tanpa Google Cloud  
☁️ **Mode Google Sheets** (Lama) - Menggunakan Google Cloud

---

## 🚀 Quick Start - Mode Lokal (3 MENIT)

### 1. Buka `.env.local`

Di folder root project, buka file `.env.local`:

```env
# OPSI 1: Database Lokal (AKTIF SEKARANG)
USE_LOCAL_DB=true

# Jika ingin pakai Google Cloud, ubah jadi false dan isi credentials
# USE_LOCAL_DB=false
```

✅ **Sudah configured!** `USE_LOCAL_DB=true` sudah aktif.

### 2. Data Lokal sudah ada di `data-local.json`

File [`data-local.json`](./data-local.json) sudah berisi:
- ✅ 4 user lokal (admin, keuangan, dokter, staff)
- ✅ 8 procedure/tindakan medis
- ✅ Class multipliers (KELAS III - PENTHOUSE)
- ✅ Doctor multipliers (standard, specialist, consultant)

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka: http://localhost:5173

**Login:**
```
Username: admin
Password: admin123
```

---

## 🎯 Apa Saja User & Procedure yang Tersedia?

### Users Lokal (data-local.json):

| Username | Password | Role | Akses |
|----------|----------|------|-------|
| admin | admin123 | admin | Semua fitur, manage user, audit |
| keuangan | keuangan123 | finance | Financial reports, audit logs |
| dokter | dokter123 | doctor | PBO calculator, view results |
| staff | staff123 | staff | Hanya calculator, change password |

### Procedures Tersedia:

```
1. Operasi Appendix - Rp 6.2 juta
2. Operasi Hernia - Rp 4.5 juta  
3. Operasi Caesar - Rp 7.2 juta
4. Persalinan Normal - Rp 2.3 juta
5. Endoskopi GI - Rp 1.9 juta
6. CT Scan Kepala - Rp 700 ribu
7. USG Obstetri - Rp 280 ribu
8. Rawat Inap ICU - Rp 2.6 juta
```

### Classes Multiplier:

```
KELAS III    → 1.0x
KELAS II     → 1.25x
KELAS I      → 1.5x
VIP          → 1.75x
VVIP         → 2.0x
PENTHOUSE    → 2.5x
ODC          → 0.8x
```

---

## 🔧 Cara Mengubah Data Lokal

### Edit Data Pengguna

Buka [`data-local.json`](./data-local.json) dan cari section `"users"`:

```json
"users": [
  {
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "name": "Administrator"
  }
  // Tambah atau edit di sini
]
```

### Tambah Procedure Baru

Cari section `"procedures"`:

```json
"procedures": [
  {
    "id": "PROC-001",
    "name": "Operasi Appendix",
    "category": "Bedah",
    "gol": "GOL I",
    "days": 3,
    "op": 2500000,        // Operasi
    "ok": 1500000,        // OK/Kamar Operasi
    "alat": 800000,       // Alat Kesehatan
    "obat": 400000,       // Farmasi
    "kamar": 300000,      // Kamar Inap per hari
    "visite": 200000,     // Visite dokter
    "admin": 100000,      // Administrasi
    "baseTariff": 6200000 // Total
  }
  // Copy & modify untuk procedure baru
]
```

**Setelah edit, save & restart development server** (Ctrl+C, lalu `npm run dev`)

---

## 🔄 Cara Switch ke Google Cloud (Jika Diperlukan Nanti)

Jika ingin menggunakan Google Sheets nanti:

### 1. Setup Google Cloud Service Account
- Follow: [SETUP.md](./SETUP.md) section "Google Cloud Setup"
- Download JSON credential file

### 2. Update `.env.local`

```env
# Ubah ini:
USE_LOCAL_DB=false

# Isi credentials dari Google Cloud:
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxxxx@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=1rtb8gYm-6CzgqSiTdWbgwl6tKoJf_NqpV9mqciXsI8U
```

### 3. Setup Spreadsheet
- Create Google Sheet dengan columns:
  - Sheet 1: Users (username, password, role, name)
  - Sheet 2: Procedures (id, name, category, gol, days, op, ok, alat, obat, kamar, visite, admin, baseTariff)
  - Sheet 3: Classes (kelas, multiplier)

### 4. Share Spreadsheet
- Go to Google Sheets
- Click SHARE
- Add: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Permission: Viewer

### 5. Restart Server

```bash
npm run dev
```

Sekarang akan read dari Google Sheets! ☁️

---

## 💾 Data Persistence

### Mode Lokal:
- Data simpan di `data-local.json` (file text)
- **Backup:** Copy `data-local.json` ke folder lain
- **Edit:** Buka dengan text editor (VS Code, Notepad++)
- **Backup otomatis:** Commit ke Git

### Mode Google Cloud:
- Data simpan di Google Sheets
- **Backup:** Google Sheets auto-sync
- **Edit:** Langsung di spreadsheet
- **Version history:** Lihat di Google Sheets version history

---

## 🛠️ Troubleshooting

### **Error: "Failed to load database"**

```
Solusi: Pastikan USE_LOCAL_DB=true di .env.local
```

### **Data tidak berubah setelah edit**

```
Solusi: Restart development server (Ctrl+C, npm run dev)
```

### **JSON syntax error di data-local.json**

```
Solusi: 
1. Buka data-local.json
2. Cek tanda koma ("," harus ada di akhir object kecuali yang terakhir)
3. Gunakan JSON validator: https://jsonlint.com
```

### **Login tidak bisa**

```
Solusi:
1. Cek username & password di "users" di data-local.json
2. Pastikan tidak ada typo
3. Restart server
```

---

## 📊 Performance

| Metrik | Local | Google Sheets |
|--------|-------|---------------|
| Load Time | ~10ms | 200-500ms |
| Offline | ✅ Yes | ❌ No |
| Setup Time | 1 menit | 30 menit |
| Data Sync | Manual | Real-time |
| Scalability | Small team | Large enterprise |

---

## 📝 Recommended Use Cases

### ✅ Gunakan Mode Lokal Jika:
- Development/testing
- Small hospital (< 100 users)
- Offline operation needed
- Quick prototype/demo
- Tidak ingin setup Google Cloud

### ✅ Gunakan Google Sheets Jika:
- Production deployment
- Large organization
- Multiple locations
- Real-time data sync needed
- Existing Google Workspace

---

## 🚀 Next Steps

### Option 1: Keep Using Local Mode
- Great untuk development & testing!
- Edit data di `data-local.json`
- Backup ke GitHub (`git commit` & `push`)

### Option 2: Switch to Google Cloud Later
- Follow steps di "Cara Switch ke Google Cloud"
- Benefits: Real-time sync, easier collaboration
- Production-ready setup

### Option 3: Deploy ke Vercel dengan Local Mode
- Works great!
- Upload `data-local.json` to Vercel
- All data persisted in JSON file

---

## 📖 Related Files

- **Data:** [`data-local.json`](./data-local.json)
- **Loader:** [`api/_lib/local-db.js`](./api/_lib/local-db.js)
- **Config:** [`.env.local`](./.env.local)
- **Setup:** [SETUP.md](./SETUP.md) - Detailed Google Cloud setup
- **Quick Reference:** [QUICKSTART.md](./QUICKSTART.md)

---

## 💬 Questions?

Cek documentation:
1. Development issues → [SETUP.md](./SETUP.md)
2. Deployment issues → [DEPLOYMENT.md](./DEPLOYMENT.md)
3. API details → [MANIFEST.md](./MANIFEST.md)
4. Quick reference → [QUICKSTART.md](./QUICKSTART.md)

---

**Status:** ✅ **Local Database Mode Ready!**

Sekarang bisa test aplikasi **tanpa perlu Google Cloud!** 🎉

Happy coding! 🚀
