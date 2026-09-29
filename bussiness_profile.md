# 📘 DOKUMENTASI SPESIFIK & LENGKAP ENDPOINT API KATAMEREKA.ID

Dokumentasi ini berisi rincian lengkap **Setiap Endpoint API**, mulai dari Full URL, Method, Header, Request Payload (Query/Body), Response JSON utuh, serta penjelasan setiap field untuk frontend `katamereka-web`.

---

## 🌐 0. BASE URL CONFIGURATION

Seluruh pemanggilan API dari frontend `katamereka-web` menggunakan variabel environment `API_URL` dan `NEXT_PUBLIC_API_URL` yang dikonfigurasi pada Dockerfile:

* **Base URL Production / Staging**: `https://api.katamereka.id`
* **Dockerfile Setting**:
  ```dockerfile
  ARG API_URL=https://api.katamereka.id
  ARG NEXT_PUBLIC_API_URL=https://api.katamereka.id
  ENV API_URL=https://api.katamereka.id
  ENV NEXT_PUBLIC_API_URL=https://api.katamereka.id
  ```

---

## 🔍 1. ENDPOINT: LIST KATALOG & PENCARIAN BISNIS

Endpoint ini digunakan oleh Halaman Pencarian & Katalog Bisnis di frontend untuk menampilkan daftar bisnis dari PostgreSQL dengan pencarian, filter wilayah, kategori, dan pagination.

* **Full URL**: `https://api.katamereka.id/businesses`
* **Method**: `GET`
* **Authorization**: `Public` (Tidak butuh Token / Bearer)
* **Headers**: `Content-Type: application/json`

### 📥 A. Query Parameters (Request)

| Parameter | Tipe Data | Wajib? | Deskripsi Field | Contoh Value |
| :--- | :--- | :--- | :--- | :--- |
| `search` | `string` | Optional | Kata kunci pencarian berdasarkan nama bisnis atau alamat | `rental` |
| `city` | `string` | Optional | Filter nama kota/kabupaten | `Bandung` |
| `province` | `string` | Optional | Filter nama provinsi | `Jawa Barat` |
| `category` | `string` | Optional | Filter jenis kategori bisnis | `car_rental` |
| `page` | `number` | Optional | Halaman data (Default: `1`) | `1` |
| `limit` | `number` | Optional | Jumlah item per halaman (Default: `20`) | `10` |

#### 💻 Contoh Request (Fetch Frontend):
```typescript
// URL: https://api.katamereka.id/businesses?search=rental&city=Bandung&page=1&limit=10
const url = `${process.env.NEXT_PUBLIC_API_URL}/businesses?search=rental&city=Bandung&page=1&limit=10`;
const response = await fetch(url);
const result = await response.json();
```

### 📤 B. Response Body (`200 OK`)

```json
{
  "data": [
    {
      "id": "83bd00c3-3335-4c45-af73-01ba8dcf9f13",
      "name": "Ponty Rental Mobil Bandung",
      "slug": "ponty-rental-mobil-bandung",
      "address": "Jl. Soekarno Hatta No. 123, Pasirluyu",
      "city": "Bandung City",
      "province": "West Java",
      "category": "service.car_rental",
      "rating": "4.50",
      "reviews_count": 12
    },
    {
      "id": "d955a5ae-0c10-4b56-ad1d-6bf90d8e8a1d",
      "name": "Sheraton Bandung Hotel & Towers",
      "slug": "sheraton-bandung-hotel-towers",
      "address": "Jl. Ir. H. Juanda No. 390",
      "city": "Bandung City",
      "province": "West Java",
      "category": "building.accommodation",
      "rating": "4.50",
      "reviews_count": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

### 📋 C. Penjelasan Field Response:
* `data[]`: Array berisi daftar ringkas bisnis yang cocok dengan filter.
  * `id`: UUID unik dari bisnis di database Katamereka.
  * `name`: Nama lengkap bisnis.
  * `slug`: Slug unik untuk link halaman detail (misal: `/bisnis/ponty-rental-mobil-bandung`).
  * `address`: Alamat jalan bisnis.
  * `city`: Nama Kota/Kabupaten.
  * `province`: Nama Provinsi.
  * `category`: Kategori utama bisnis.
  * `rating`: Nilai rating bintang (0.00 - 5.00).
  * `reviews_count`: Total ulasan yang masuk.
* `pagination`: Metadata untuk navigasi halaman di UI frontend.
  * `page`: Halaman aktif saat ini.
  * `limit`: Jumlah data per halaman.
  * `total`: Total seluruh data bisnis yang ditemukan.
  * `total_pages`: Total jumlah halaman yang tersedia.

---

## 📖 2. ENDPOINT: DETAIL PROFIL BISNIS BERDASARKAN SLUG (SEO FRIENDLY)

Endpoint ini digunakan saat user membuka halaman detail bisnis via URL slug (contoh: `/bisnis/ponty-rental-mobil-bandung`).

* **Full URL**: `https://api.katamereka.id/businesses/slug/:slug`
* **Method**: `GET`
* **Authorization**: `Public` (Tidak butuh Token / Bearer)
* **Headers**: `Content-Type: application/json`

### 📥 A. Path Parameter (Request)

| Parameter | Tipe Data | Wajib? | Deskripsi Field | Contoh Value |
| :--- | :--- | :--- | :--- | :--- |
| `:slug` | `string` | Ya | Slug unik bisnis yang ada di URL browser | `ponty-rental-mobil-bandung` |

#### 💻 Contoh Request (Fetch Frontend):
```typescript
// URL: https://api.katamereka.id/businesses/slug/ponty-rental-mobil-bandung
const slug = "ponty-rental-mobil-bandung";
const url = `${process.env.NEXT_PUBLIC_API_URL}/businesses/slug/${slug}`;
const response = await fetch(url);
const result = await response.json();
```

### 📤 B. Response Body (`200 OK`)

```json
{
  "message": "Berhasil mengambil detail bisnis berdasarkan slug dari PostgreSQL",
  "data": {
    "id": "83bd00c3-3335-4c45-af73-01ba8dcf9f13",
    "name": "Ponty Rental Mobil Bandung",
    "slug": "ponty-rental-mobil-bandung",
    "externalSource": "GEOAPIFY",
    "externalId": "51a8dce973dae65a40593ad5b551f8af1bc0f00101f9014ecaca0000000000c0020892030c42616e64756e672043697479",
    "address": "Jl. Soekarno Hatta No. 123, Pasirluyu",
    "city": "Bandung City",
    "province": "West Java",
    "country": "ID",
    "postalCode": "40256",
    "latitude": -6.9381234,
    "longitude": 107.6624567,
    "phone": "+628123456789",
    "email": "info@pontyrental.com",
    "website": "https://pontyrental.com",
    "category": "service.car_rental",
    "categories": [
      "service",
      "service.car_rental"
    ],
    "externalRating": "4.50",
    "externalReviewsCount": 12,
    "status": "ACTIVE",
    "externalSyncedAt": "2026-09-23T15:19:00.000Z",
    "createdAt": "2026-09-23T15:19:00.000Z",
    "updatedAt": "2026-09-23T15:19:00.000Z",
    "members": [
      {
        "id": "11223344-5566-7788-9900-aabbccddeeff",
        "userId": "fa3b21c4-8899-4d11-bc01-998877665544",
        "name": "Ahmad Subagja",
        "email": "ahmad@gmail.com",
        "role": "OWNER",
        "createdAt": "2026-09-23T15:19:00.000Z"
      }
    ]
  }
}
```

### 📋 C. Penjelasan Field Response:
* `externalSource`: Asal sumber data profil bisnis (`"GEOAPIFY"`).
* `externalId`: ID Unik lokasi dari provider eksternal (Geoapify Place ID).
* `latitude` & `longitude`: Koordinat lokasi peta untuk ditampilkan di Google Maps / Leaflet Peta Frontend.
* `categories`: Array daftar semua tag kategori lokasi.
* `status`: Status aktif bisnis (`"ACTIVE"` / `"INACTIVE"`).
* `externalSyncedAt`: Waktu terakhir data disinkronkan dari provider.
* `members`: Daftar pemilik/pengelola bisnis di platform Katamereka (`OWNER` / `MEMBER`).

---

## 🆔 3. ENDPOINT: DETAIL PROFIL BISNIS BERDASARKAN ID (UUID)

Endpoint ini digunakan untuk mengambil data bisnis lengkap menggunakan UUID ID.

* **Full URL**: `https://api.katamereka.id/businesses/:id`
* **Method**: `GET`
* **Authorization**: `Public` (Tidak butuh Token / Bearer)
* **Headers**: `Content-Type: application/json`

### 📥 A. Path Parameter (Request)
* `:id` (UUID, Wajib) ➔ Contoh: `83bd00c3-3335-4c45-af73-01ba8dcf9f13`

#### 💻 Contoh Request (Fetch Frontend):
```typescript
const id = "83bd00c3-3335-4c45-af73-01ba8dcf9f13";
const url = `${process.env.NEXT_PUBLIC_API_URL}/businesses/${id}`;
const response = await fetch(url);
const result = await response.json();
```

---

## 🔄 4. ENDPOINT INTERNAL: SINKRONISASI DATA BISNIS (INGESTION)

Endpoint ini digunakan untuk memicu proses penarikan data bisnis massal dari Geoapify ke database PostgreSQL Katamereka (UPSERT).

* **Full URL**: `https://api.katamereka.id/internal/businesses/sync`
* **Method**: `POST`
* **Authorization**: `Public / Internal`
* **Headers**: `Content-Type: application/json`

### 📥 A. Request Body (JSON)

```json
{
  "keyword": "rental mobil",
  "location": "Bandung"
}
```

### 📤 B. Response Body (`201 Created`)

```json
{
  "success": true,
  "fetched": 52,
  "inserted": 50,
  "updated": 0,
  "failed": 2
}
```

---

## 🔐 5. ENDPOINT DUKUNGAN: AUTHENTICATION (LOGIN & REGISTER)

### 1️⃣ REGISTER USER BARU
* **Full URL**: `https://api.katamereka.id/auth/register`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "name": "Subagja",
    "email": "subagja@gmail.com",
    "password": "Password123!",
    "otp": "123456"
  }
  ```
* **Response Body (`201 Created`)**:
  ```json
  {
    "message": "Registrasi berhasil",
    "user": {
      "id": "fa3b21c4-8899-4d11-bc01-998877665544",
      "name": "Subagja",
      "email": "subagja@gmail.com",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2️⃣ LOGIN USER
* **Full URL**: `https://api.katamereka.id/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "email": "subagja@gmail.com",
    "password": "Password123!"
  }
  ```
* **Response Body (`200 OK`)**:
  ```json
  {
    "message": "Login berhasil",
    "user": {
      "id": "fa3b21c4-8899-4d11-bc01-998877665544",
      "name": "Subagja",
      "email": "subagja@gmail.com",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```