## Purpose

Fitur artikel multi-author dengan editorial workflow untuk platform komunitas Pekanbaru: semua user yang login dapat menulis dan mengelola draft, editor mereview sebelum tayang, artikel published tampil di halaman publik dengan SSR penuh, SEO meta tags, GEO signals (JSON-LD Article), dan RSS feed.

## ADDED Requirements

### Requirement: Semua user yang login dapat membuat dan mengedit draft artikel

Setiap user yang terautentikasi SHALL dapat membuat artikel baru dengan judul, excerpt, body (Markdown), dan cover image opsional. User SHALL dapat menyimpan sebagai draft kapan saja tanpa batasan. User SHALL hanya dapat mengedit artikel miliknya sendiri selama status masih `draft` atau `in_review`.

#### Scenario: User membuat artikel baru

- **WHEN** user yang login mengakses `/my-articles/new` dan mengisi judul, excerpt, body lalu menyimpan
- **THEN** artikel tersimpan dengan status `draft`, slug di-generate otomatis dari judul, dan user diarahkan ke halaman edit artikel

#### Scenario: User mengedit draft miliknya

- **WHEN** user mengakses `/my-articles/[id]` untuk artikel miliknya yang berstatus `draft`
- **THEN** form edit ditampilkan dan perubahan dapat disimpan

#### Scenario: User tidak dapat mengedit artikel orang lain

- **WHEN** user mengakses halaman edit artikel milik user lain
- **THEN** server mengembalikan 403 dan user diarahkan ke `/my-articles`

---

### Requirement: Slug di-generate otomatis dari judul dan dapat diedit manual

Saat artikel pertama kali disimpan, sistem SHALL men-generate slug dari judul dengan aturan: lowercase, spasi menjadi dash, karakter non-alphanumeric dihapus. Jika slug sudah ada di DB, sistem SHALL menambahkan suffix angka (`-2`, `-3`, dst) hingga slug unik ditemukan. Penulis SHALL dapat mengubah slug secara manual selama artikel belum published maupun setelah published.

#### Scenario: Slug di-generate otomatis dari judul baru

- **WHEN** user menyimpan artikel baru dengan judul "Cara Membuat Rendang Pekanbaru"
- **THEN** slug menjadi `cara-membuat-rendang-pekanbaru`

#### Scenario: Slug duplikat mendapat suffix angka

- **WHEN** slug `cara-membuat-rendang-pekanbaru` sudah ada di DB dan user menyimpan artikel baru dengan judul yang sama
- **THEN** slug artikel baru menjadi `cara-membuat-rendang-pekanbaru-2`

#### Scenario: Slug diedit manual

- **WHEN** penulis mengubah slug secara manual di form edit dan menyimpan
- **THEN** slug tersimpan sesuai input penulis (setelah sanitasi); jika slug baru konflik, server mengembalikan error validasi

---

### Requirement: Artikel yang diubah slugnya setelah published membuat redirect otomatis

Saat slug artikel berstatus `published` diubah, sistem SHALL menyimpan slug lama ke tabel `post_slug_redirects`. Permintaan ke `/blog/[slug-lama]` SHALL di-redirect 301 ke `/blog/[slug-baru]`.

#### Scenario: Akses slug lama setelah slug diubah

- **WHEN** slug artikel published diubah dari `artikel-lama` ke `artikel-baru` dan kemudian ada request ke `/blog/artikel-lama`
- **THEN** server mengembalikan redirect 301 ke `/blog/artikel-baru`

#### Scenario: Slug lama yang post-nya dihapus tidak redirect ke mana-mana

- **WHEN** artikel dihapus (cascade delete `post_slug_redirects`)
- **THEN** request ke slug lama mengembalikan 404

---

### Requirement: Editorial workflow draft → in_review → published

Penulis SHALL dapat mengubah status artikel dari `draft` ke `in_review` (submit for review). Editor atau admin SHALL dapat mengubah status dari `in_review` ke `published` (approve) atau kembali ke `draft` disertai catatan review (reject). Admin SHALL dapat mengubah status ke `archived`.

#### Scenario: Penulis submit artikel untuk review

- **WHEN** penulis menekan tombol "Kirim untuk Review" pada artikel berstatus `draft`
- **THEN** status artikel berubah menjadi `in_review` dan artikel tidak dapat diedit penulis sampai di-reject kembali

#### Scenario: Editor menyetujui artikel

- **WHEN** editor mengakses `/admin/articles/[id]` dan menekan "Setujui"
- **THEN** status berubah ke `published`, `published_at` diisi timestamp sekarang, `reviewed_by` diisi ID editor

#### Scenario: Editor menolak artikel dengan catatan

- **WHEN** editor menekan "Tolak" dan mengisi catatan review
- **THEN** status kembali ke `draft`, `review_note` tersimpan, penulis dapat melihat catatan dan mengedit ulang

#### Scenario: User biasa tidak dapat approve atau reject

- **WHEN** user dengan role `user` mencoba mengakses `/admin/articles`
- **THEN** server mengembalikan redirect 303 ke `/`

---

### Requirement: Halaman publik blog di-render SSR dengan SEO dan GEO signals

Halaman `/blog` dan `/blog/[slug]` SHALL di-render di server (SSR). Setiap halaman artikel SHALL menyertakan: `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type=article`, `article:published_time`, `article:author`), dan JSON-LD Article schema. Halaman listing `/blog` SHALL menyertakan JSON-LD ItemList.

#### Scenario: Halaman artikel diakses oleh crawler

- **WHEN** crawler mengakses `/blog/[slug]` untuk artikel published
- **THEN** response HTML mengandung `<title>`, `<meta name="description">`, `<link rel="canonical">`, tag Open Graph, dan blok `<script type="application/ld+json">` dengan Article schema yang valid

#### Scenario: Artikel yang belum published tidak dapat diakses publik

- **WHEN** request masuk ke `/blog/[slug]` untuk artikel berstatus `draft`, `in_review`, atau `archived`
- **THEN** server mengembalikan 404

#### Scenario: Artikel tidak ditemukan

- **WHEN** request masuk ke `/blog/[slug]` dan slug tidak ada di `posts` maupun `post_slug_redirects`
- **THEN** server mengembalikan 404

---

### Requirement: RSS feed tersedia di `/blog/rss.xml`

Sistem SHALL menyediakan RSS 2.0 feed di `/blog/rss.xml` yang memuat semua artikel published terbaru (maksimal 20 item), diurutkan `published_at` descending. Setiap item SHALL menyertakan `<title>`, `<link>`, `<description>` (excerpt), `<pubDate>`, dan `<guid>` (canonical URL).

#### Scenario: Crawler mengakses RSS feed

- **WHEN** GET request ke `/blog/rss.xml`
- **THEN** server mengembalikan response dengan `Content-Type: application/rss+xml` dan body XML yang valid berisi artikel published

---

### Requirement: Sitemap diperluas dengan URL artikel

`/sitemap.xml` SHALL menyertakan semua artikel published, masing-masing dengan `<loc>` canonical URL dan `<lastmod>` dari `updated_at` atau `published_at`.

#### Scenario: Sitemap mengandung artikel published

- **WHEN** GET request ke `/sitemap.xml`
- **THEN** response XML mengandung `<url>` untuk setiap artikel published dengan `<loc>` dan `<lastmod>` yang benar

---

### Requirement: Cover image opsional dengan placeholder fallback

Penulis SHALL dapat mengupload cover image (PNG, JPEG, WebP, maks 2MB) saat membuat atau mengedit artikel. Cover image TIDAK wajib. Jika tidak ada cover image, sistem SHALL menampilkan placeholder image di listing dan detail halaman.

#### Scenario: Artikel tanpa cover image menampilkan placeholder

- **WHEN** artikel published tidak memiliki `cover_image_url`
- **THEN** halaman artikel dan card di listing menampilkan placeholder image

#### Scenario: Upload cover image melebihi batas ukuran

- **WHEN** penulis mengupload file lebih dari 2MB
- **THEN** server mengembalikan error validasi dan cover image tidak tersimpan
