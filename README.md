# Gresik Building 360

Versi baru konsep Virtual Tour untuk **bangunan gedung pemerintah/fasilitas publik Kabupaten Gresik**.

## Struktur
```text
assets/
├── panoramas/   # foto 360 equirectangular 2:1
├── images/      # foto cover/detail
├── logo/        # logo/branding
└── maps/        # denah/peta tambahan
index.html
style.css
script.js
```

## Cara memakai
1. Buka `index.html` atau deploy folder ini ke GitHub Pages.
2. Ganti file pada `assets/panoramas/` dan `assets/images/` dengan aset asli.
3. Edit objek `BUILDINGS` pada `script.js`: `name`, `address`, `coords`, `pbg`, `slf`, `description`, dan `hotspots`.
4. Untuk panorama, gunakan format **equirectangular 2:1**.
5. Posisi hotspot memakai `pitch` dan `yaw` Pannellum seperti versi proyek sebelumnya.

## Catatan penting
Semua nama, koordinat, status PBG/SLF, dan data teknis dalam paket ini adalah contoh/dummy. Verifikasi dengan sumber resmi sebelum digunakan publik.
