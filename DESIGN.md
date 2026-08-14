---
name: PKUBersua
description: Teal-and-yellow event and community discovery page for Pekanbaru.
---

# Design System: PKUBersua

`ref.html` adalah sumber kebenaran visual. Implementasi halaman publik menggunakan utility Tailwind langsung di markup; hindari selector CSS lokal baru kecuali ada kebutuhan teknis yang tidak dapat dicapai Tailwind.

## Direction

Creative north star: **The Local Meetup Board**. Halaman terasa hidup dan ramah seperti direktori event lokal: hero kuat, pencarian jelas, kartu mudah dipindai, dan CTA langsung. Gunakan whitespace secukupnya untuk menjaga hirarki, tetapi jangan mengubahnya menjadi bulletin editorial yang terlalu sunyi.

## Palette

- Teal brand: `#073d3d` untuk hero, footer, dan CTA gelap.
- Teal soft: `#0a5350` untuk link dan aksen navigasi.
- Ink: `#102126` untuk teks utama.
- Muted: `#66747a` untuk metadata dan deskripsi.
- Line: `#e8ecec` untuk border tipis.
- Sun: `#f7b91d` untuk CTA utama, dengan `#ffd66f` untuk highlight hero.
- White adalah surface kartu dan form; gunakan gradasi hanya pada hero, CTA subscription, dan placeholder visual seperti pada referensi.

## Typography

Hanken Grotesk digunakan untuk display dan body; Manrope digunakan untuk label kecil. Headline hero tebal, rapat namun tidak di bawah `-0.045em`. Metadata dan label boleh berukuran kecil, tetapi harus tetap terbaca.

## Layout

- Container publik maksimum sekitar `1180px` dengan padding horizontal responsif.
- Hero minimum sekitar `540px`.
- Search box berada di area bawah hero dan memakai shadow kuat sebagai titik fokus.
- Event populer memakai empat kolom pada layar lebar; komunitas lima kolom; artikel empat kolom.
- Gunakan `sm`, `md`, `lg`, dan `xl` bila paling tepat untuk mengikuti referensi; utility semantic breakpoint lama tidak wajib dipakai pada landing page ini.
- Pada mobile, grid turun menjadi dua kolom atau satu kolom sesuai kepadatan konten.

## Components

Komponen utama: brand mark, top navigation, hero search, category tile, event card, community card, newsletter CTA, article card, partner panel, dan footer. Gunakan ikon `@lucide/svelte`. Interaksi ringan berupa hover, focus, toast, menu mobile, bookmark, join, dan subscribe.

## Do / Don't

- Do pertahankan teal + sun sebagai identitas utama.
- Do tampilkan tanggal, lokasi, harga/status, dan CTA pada event card.
- Do gunakan Tailwind utility classes pada Svelte markup.
- Don't mengembalikan palette cream/gold editorial lama sebagai arah utama.
- Don't menambahkan CSS component-level baru bila utility Tailwind sudah cukup.
- Don't memakai gradient text, sidebar padat, countdown widget, atau dekorasi yang tidak membantu discovery.
