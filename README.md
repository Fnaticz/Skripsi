# Buat Kamu — Aplikasi Buat Yang Tercinta

Aplikasi ini merupakan pengabadian.

Semoga bisa dipake yaaa

## Fitur Lengkap

| Modul | Fitur |
|-------|-------|
| **Proyek** | CRUD, data desain, 6 tahapan, persetujuan klien |
| **Tahapan** | Checklist, dokumen, catatan, modal kelola per tahap |
| **RAB/BoQ** | Template spesialisasi, volume otomatis dari desain, edit inline |
| **Export** | Laporan PDF, RAB PDF, RAB CSV (Excel), Paket Pengadaan PDF |
| **Pengawasan** | Laporan kunjungan lapangan Tahap 6 |
| **Referensi** | Spesialisasi, HKI, tahapan IAI |
| **Utilitas** | Log aktivitas, backup/restore JSON, welcome onboarding |

## Instalasi & Menjalankan

```bash
cd arsitektur-app
npm install
npm start
```

## Build Installer Windows (.exe)

```powershell
cd arsitektur-app
npm install
$env:CSC_IDENTITY_AUTO_DISCOVERY='false'
npm run build
```

Hasil:
- **Installer:** `dist/Buat Kamu Setup 2.0.0.exe`
- **Portable:** `dist/win-unpacked/Buat Kamu.exe` (via `npm run build:dir`)

## Alur Kerja Lengkap

```
1. Buat Proyek (+ data desain: luas bangunan, tapak, lantai)
2. Tahap 1–3: Konsep → Prarancangan → Pengembangan
3. Tahap 4: Gambar Kerja + Generate RAB dari template
4. Simpan RAB (sync anggaran otomatis)
5. Tahap 5: Export Paket Pengadaan (RAB + RKS) untuk pelelangan
6. Tahap 6: Laporan Pengawasan Berkala
7. Export laporan lengkap PDF kapan saja
```
## Gambar Aplikasi



## Shortcut

| Shortcut | Aksi |
|----------|------|
| `Ctrl+N` | Proyek Baru |
| `Ctrl+E` | Export Laporan PDF |
| `Ctrl+R` | Export RAB PDF |

## Data

Disimpan di `%APPDATA%/buat-kamu/`

Backup via menu **File → Backup Data**
