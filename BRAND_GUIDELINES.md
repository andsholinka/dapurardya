# Brand Guidelines - Dapur Ardya

## Palet Warna Brand

Palet warna Dapur Ardya dirancang untuk menciptakan suasana yang hangat, lembut, dan mengundang - sempurna untuk aplikasi resep masakan yang ramah dan modern.

### Warna Utama

1. **Sky Blue** - `#99CDD8`
   - Warna utama brand
   - Digunakan untuk: Primary buttons, links, highlights
   - Memberikan kesan segar dan bersih
   - CSS Variable: `--primary`

2. **Mint Cream** - `#DAEEDC`
   - Warna sekunder
   - Digunakan untuk: Backgrounds, cards, subtle accents
   - Memberikan kesan natural dan menenangkan
   - CSS Variable: `--secondary`

3. **Peach Cream** - `#FDE8D3`
   - Warna aksen hangat
   - Digunakan untuk: Hover states, warm accents, chart colors
   - Memberikan kesan hangat dan ramah

4. **Salmon Pink** - `#F3C1B2`
   - Warna aksen
   - Digunakan untuk: Call-to-action, important highlights
   - Memberikan kesan feminin dan menarik
   - CSS Variable: `--accent`

5. **Sage Green** - `#C8E6C7`
   - Warna pendukung
   - Digunakan untuk: Success states, natural elements
   - Memberikan kesan organik dan sehat

6. **Slate Gray** - `#657166`
   - Warna teks dan elemen gelap
   - Digunakan untuk: Text, borders, subtle elements
   - Memberikan kontras yang baik dan mudah dibaca
   - CSS Variable: `--foreground`

## Penggunaan Warna

### Primary Actions
- Background: Sky Blue (#99CDD8)
- Text: White
- Hover: Sky Blue dengan opacity 80%

### Secondary Elements
- Background: Mint Cream (#DAEEDC)
- Text: Slate Gray (#657166)

### Accent & Highlights
- Salmon Pink (#F3C1B2) untuk call-to-action
- Sage Green (#C8E6C7) untuk success states

### Backgrounds
- Main: #FAFCFB (off-white dengan hint hijau)
- Card: #FFFFFF (pure white)
- Muted: #F5F9F7 (very light mint)

### Text & Borders
- Primary Text: Slate Gray (#657166)
- Muted Text: #8A9189
- Borders: #E0EBE5 (light sage)

## CSS Variables

Semua warna brand tersedia sebagai CSS variables di `src/app/globals.css`:

```css
--brand-sky-blue: #99CDD8;
--brand-mint-cream: #DAEEDC;
--brand-peach-cream: #FDE8D3;
--brand-salmon-pink: #F3C1B2;
--brand-sage-green: #C8E6C7;
--brand-slate-gray: #657166;
```

## Tailwind Utility Classes

Gunakan utility classes berikut untuk akses cepat ke warna brand:

```css
/* Backgrounds */
.bg-brand-sky
.bg-brand-mint
.bg-brand-peach
.bg-brand-salmon
.bg-brand-sage
.bg-brand-slate

/* Text Colors */
.text-brand-sky
.text-brand-mint
.text-brand-peach
.text-brand-salmon
.text-brand-sage
.text-brand-slate

/* Border Colors */
.border-brand-sky
.border-brand-mint
.border-brand-peach
.border-brand-salmon
.border-brand-sage
.border-brand-slate
```

## Prinsip Desain

- **Rounded Corners**: 0.75rem (12px) untuk konsistensi
- **Shadows**: Gentle shadows untuk depth tanpa terlalu dramatis
- **Spacing**: Generous spacing untuk readability
- **Mobile-First**: Desain dimulai dari mobile, kemudian scale up
- **Accessibility**: Contrast ratios yang memenuhi WCAG AA standards

## Implementasi

Semua komponen sudah menggunakan CSS variables yang otomatis mengikuti brand colors:

- `bg-primary` → Sky Blue
- `bg-secondary` → Mint Cream
- `bg-accent` → Salmon Pink
- `text-foreground` → Slate Gray
- `border-border` → Light Sage

## Theme Color (PWA)

- Theme Color: `#99CDD8` (Sky Blue)
- Background Color: `#FAFCFB` (Off-white)

Sudah diterapkan di:
- `manifest.json`
- `layout.tsx` viewport
- NextTopLoader progress bar
