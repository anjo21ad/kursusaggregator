# Kursusaggregator Web Design Styleguide
**Version 1.0**

---

## Indholdsfortegnelse

1. [Introduktion](#introduktion)
2. [Design System](#design-system)
3. [Branding](#branding)
4. [Farver & Kontrast](#farver--kontrast)
5. [Typografi](#typografi)
6. [Layout](#layout)
7. [Komponenter](#komponenter)
8. [Ikoner](#ikoner)
9. [Formularer](#formularer)
10. [Navigation](#navigation)
11. [Interaktivitet](#interaktivitet)
12. [Accessibility](#accessibility)
13. [Performance](#performance)
14. [Browser Support](#browser-support)

---

## Introduktion

Dette dokument beskriver design-retningslinjer for kursusaggregator-platformen, en B2B-markedsplads der forbinder kursusudbydere med virksomheder der søger kompetenceudvikling til deres medarbejdere.

### Retningslinjetyper

- **⚠️ Krav**: Skal følges for at opretholde brand-konsistens
- **💡 Anbefaling**: Bør følges i de fleste tilfælde
- **✨ Forslag**: Best practices, brug hvis muligt

Medmindre andet er angivet, er alle retningslinjer **anbefalinger**.

---

## Design System

### Tech Stack
- **Framework**: Next.js 15 med Pages Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL med Prisma ORM
- **Authentication**: Supabase Auth
- **Betalinger**: Stripe

### Design Principper
1. **Dark Mode First**: Platformen bruger primært mørke farver
2. **B2B Professionalism**: Rent, moderne design med fokus på funktionalitet
3. **Responsive**: Mobile-first tilgang til alle komponenter
4. **Accessibility**: WCAG 2.1 Level AA compliance

---

## Branding

### Platform Navn
**CourseHub** - B2B Kursusplatform

### Branding Statement
> "Din B2B Kursusplatform - Find og administrér kompetenceudvikling ét sted"

### Logo Anvendelse
⚠️ **Krav**: Logo skal være synlig på alle sider, placeret øverst i venstre hjørne af navigation.

**Logo Farver**:
- På mørk baggrund (#0F0F1A): Brug hvid (#F5F5F7)
- På lys baggrund: Brug primary farve (#FF6A3D)

---

## Farver & Kontrast

### Primær Farvepalet

```css
/* Primary Colors */
--primary: #FF6A3D;           /* Orange - Call-to-action, primære knapper */
--primary-dark: #E2572D;      /* Hover state for primary */
--secondary: #7E6BF1;         /* Lilla - Sekundære actions, badges */

/* Background Colors */
--background: #0F0F1A;        /* Hovedbaggrund - mørk blå/sort */
--card: #1C1C2E;              /* Card baggrund - lysere mørk blå */

/* Text Colors */
--text-light: #F5F5F7;        /* Primær tekst - næsten hvid */
--text-muted: #A0A0B2;        /* Sekundær tekst - grålig */

/* Accent Colors */
--accent: #3ABEFF;            /* Cyan - Links, highlights */
--success: #38D39F;           /* Grøn - Success states */
```

### Farve Anvendelse

#### Primary (#FF6A3D)
✅ **Brug til**:
- Call-to-action knapper ("Log ind", "Køb kursus")
- Pris-visning
- Vigtige handlinger

❌ **Undgå**:
- Baggrundsfylde på store områder
- Tekst på lys baggrund (dårlig kontrast)

#### Secondary (#7E6BF1)
✅ **Brug til**:
- Sekundære knapper ("Bliv Udbyder", "Tal med os")
- Status badges
- Alternative actions

#### Background (#0F0F1A)
⚠️ **Krav**: Bruges som standard baggrund på alle sider.

#### Card (#1C1C2E)
💡 **Anbefaling**: Brug til:
- Content cards (kursuskort)
- Modal dialogs
- Navigation bar
- Form containers

### Kontrast Krav

⚠️ **Krav**: Alle tekst-farve kombinationer skal opfylde WCAG 2.1 Level AA:
- Normal tekst: Minimum 4.5:1 kontrast
- Large tekst (18pt+): Minimum 3:1 kontrast

**Godkendte Kombinationer**:
- `#F5F5F7` på `#0F0F1A` ✅
- `#F5F5F7` på `#1C1C2E` ✅
- `#A0A0B2` på `#0F0F1A` ✅
- `#FF6A3D` på `#0F0F1A` ✅

---

## Typografi

### Font Familie
💡 **Anbefaling**: Brug system fonts for optimal performance:

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, 'Helvetica Neue', Arial,
             sans-serif;
```

### Font Størrelser

```css
/* Headings */
--text-4xl: 2.25rem;   /* 36px - Hero headings */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-xl: 1.25rem;    /* 20px - Card titles */

/* Body */
--text-base: 1rem;     /* 16px - Standard body text */
--text-sm: 0.875rem;   /* 14px - Small text, captions */
```

⚠️ **Krav**: Body tekst skal minimum være 16px (1rem).

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

💡 **Anbefaling**: Brug semibold (600) for knap-tekst og headings.

### Line Height

```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Spacious reading */
```

⚠️ **Krav**: Body tekst skal have minimum `line-height: 1.5`.

### Typografi Eksempler

```html
<!-- Hero Heading -->
<h1 class="text-4xl font-bold text-text-light">
  Din B2B Kursusplatform
</h1>

<!-- Section Heading -->
<h2 class="text-2xl font-bold text-text-light">
  Tilgængelige Kurser
</h2>

<!-- Card Title -->
<h3 class="text-xl font-semibold text-text-light">
  Kursus Titel
</h3>

<!-- Body Text -->
<p class="text-base text-text-muted">
  Beskrivelse af kurset...
</p>

<!-- Small Text -->
<span class="text-sm text-text-muted">
  Udbyder: Firma A/S
</span>
```

---

## Layout

### Container Bredder

```css
--max-w-sm: 24rem;    /* 384px - Små komponenter */
--max-w-md: 28rem;    /* 448px - Login forms */
--max-w-5xl: 64rem;   /* 1024px - Standard content */
--max-w-7xl: 80rem;   /* 1280px - Wide layouts */
```

💡 **Anbefaling**: Brug `max-w-5xl` som standard content container.

### Spacing System

Tailwind's standard spacing scale bruges:

```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-12: 3rem;    /* 48px */
--spacing-20: 5rem;    /* 80px */
```

### Grid System

💡 **Anbefaling**: Brug CSS Grid til kursuskort-layout:

```html
<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards her -->
</div>
```

**Breakpoints**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Responsive Design

⚠️ **Krav**: Alle layouts skal være responsive ned til 320px viewport bredde.

```html
<!-- Mobile-first eksempel -->
<div class="flex flex-col sm:flex-row gap-4">
  <button>Primary Action</button>
  <button>Secondary Action</button>
</div>
```

---

## Komponenter

### Buttons

#### Primary Button
```html
<button class="px-6 py-3 bg-primary rounded-xl text-white
               hover:bg-primary-dark transition-colors font-semibold">
  Log ind
</button>
```

**Specifikationer**:
- Padding: `px-6 py-3` (24px × 12px)
- Border radius: `rounded-xl` (12px)
- Font weight: `font-semibold` (600)
- Transition: `transition-colors`

#### Secondary Button
```html
<button class="px-6 py-3 bg-card border border-secondary text-secondary
               hover:bg-secondary hover:text-white rounded-xl
               transition-colors font-semibold">
  Bliv Udbyder
</button>
```

#### Button States

```css
/* Default */
.btn-primary {
  background: #FF6A3D;
  color: #FFFFFF;
}

/* Hover */
.btn-primary:hover {
  background: #E2572D;
}

/* Focus */
.btn-primary:focus {
  outline: none;
  ring: 2px;
  ring-color: #FF6A3D;
  ring-offset: 2px;
}

/* Disabled */
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Cards

#### Standard Course Card
```html
<div class="bg-card rounded-2xl p-6 shadow-lg
            hover:shadow-xl transition-shadow">
  <h3 class="text-xl font-semibold text-text-light">
    Kursus Titel
  </h3>
  <p class="text-text-muted mt-2">
    Beskrivelse...
  </p>
  <div class="mt-4 flex justify-between items-center">
    <span class="text-primary font-bold">1.500 kr</span>
    <button class="px-4 py-2 bg-primary rounded-xl text-white
                   hover:bg-primary-dark transition-colors font-semibold">
      Læs mere
    </button>
  </div>
  <p class="text-text-muted text-sm mt-2">
    Udbyder: Firma A/S
  </p>
</div>
```

**Specifikationer**:
- Background: `bg-card` (#1C1C2E)
- Border radius: `rounded-2xl` (16px)
- Padding: `p-6` (24px)
- Shadow: `shadow-lg` med `hover:shadow-xl`

### Navigation Bar

```html
<nav class="bg-card/80 backdrop-blur-sm border-b border-text-muted/20">
  <div class="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
    <div class="text-2xl font-bold text-text-light">CourseHub</div>
    <div class="hidden md:flex space-x-8">
      <a href="#" class="text-text-muted hover:text-text-light
                        transition-colors">
        Kurser
      </a>
      <!-- More nav items -->
    </div>
    <div class="flex space-x-4">
      <!-- CTA buttons -->
    </div>
  </div>
</nav>
```

**Specifikationer**:
- Background: Semi-transparent card (`bg-card/80`)
- Backdrop blur: `backdrop-blur-sm`
- Border: `border-b border-text-muted/20`
- Height: `py-4` (16px top/bottom)

---

## Ikoner

💡 **Anbefaling**: Brug flat, line-style ikoner.

**Icon Libraries**:
- Heroicons (recommended)
- Lucide Icons
- Phosphor Icons

### Icon Størrelser
```css
--icon-sm: 16px;   /* Small icons */
--icon-md: 24px;   /* Standard icons */
--icon-lg: 32px;   /* Large icons */
```

### Icon + Text Kombination
✨ **Forslag**: Kombiner altid ikoner med tekst hvor der er plads:

```html
<button class="flex items-center gap-2">
  <svg class="w-5 h-5"><!-- Icon --></svg>
  <span>Edit</span>
</button>
```

---

## Formularer

### Text Input
```html
<div>
  <label class="block text-sm font-medium text-text-light mb-2">
    Email
  </label>
  <input
    type="email"
    placeholder="din@email.dk"
    class="w-full px-4 py-3 bg-background border border-text-muted/20
           rounded-xl text-text-light placeholder-text-muted
           focus:outline-none focus:ring-2 focus:ring-primary
           focus:border-transparent"
  />
</div>
```

**Specifikationer**:
- Padding: `px-4 py-3`
- Border: `border border-text-muted/20`
- Border radius: `rounded-xl`
- Focus state: 2px ring i primary farve

### Form Layout

💡 **Anbefaling**: Placer labels over input felter:

```html
<div class="space-y-6">
  <div>
    <label>Email</label>
    <input type="email" />
  </div>
  <div>
    <label>Password</label>
    <input type="password" />
  </div>
</div>
```

### Required Fields

✨ **Forslag**: Marker required fields med rød asterisk:

```html
<label class="block text-sm font-medium text-text-light mb-2">
  Email <span class="text-red-400">*</span>
</label>
```

### Error States

```html
<div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20
            text-red-400">
  Login fejlede: Forkert email eller adgangskode
</div>
```

### Success States

```html
<div class="p-4 rounded-xl bg-success/10 border border-success/20
            text-success">
  Bruger oprettet! Tjek din email for bekræftelse.
</div>
```

---

## Navigation

### Desktop Navigation

💡 **Anbefaling**: Vis navigation links direkte på desktop:

```html
<div class="hidden md:flex space-x-8">
  <a href="#" class="text-text-muted hover:text-text-light
                    transition-colors">
    Kurser
  </a>
  <a href="#" class="text-text-muted hover:text-text-light
                    transition-colors">
    For Virksomheder
  </a>
</div>
```

### Mobile Navigation

✨ **Forslag**: På mobil, brug hamburger menu eller placér navigation nederst:

```html
<!-- Hamburger icon -->
<button class="md:hidden">
  <svg class="w-6 h-6"><!-- Menu icon --></svg>
</button>
```

### Active State

💡 **Anbefaling**: Marker aktiv side med primary farve:

```html
<a href="#" class="text-primary font-semibold border-b-2 border-primary">
  Kurser
</a>
```

---

## Interaktivitet

### Hover Effects

💡 **Anbefaling**: Brug subtile transitions:

```css
.interactive-element {
  transition-property: colors, transform, box-shadow;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}
```

### Touch Targets

⚠️ **Krav**: Alle interaktive elementer skal minimum være 44×44 pixels for touch devices.

```html
<button class="min-h-[44px] min-w-[44px] px-4 py-2">
  Click Me
</button>
```

### Loading States

✨ **Forslag**: Vis loading indicator ved async operations:

```html
<button disabled class="opacity-50 cursor-not-allowed">
  <svg class="animate-spin h-5 w-5"><!-- Spinner --></svg>
  Loading...
</button>
```

---

## Accessibility

### WCAG 2.1 Compliance

⚠️ **Krav**: Platformen skal opfylde WCAG 2.1 Level AA.

**Checklist**:
- ✅ Tilstrækkelig farvekontrast (4.5:1 for normal tekst)
- ✅ Keyboard navigation til alle interaktive elementer
- ✅ Screen reader support (ARIA labels)
- ✅ Focus indicators
- ✅ Alt text på billeder

### Keyboard Navigation

⚠️ **Krav**: Alle funktioner skal være tilgængelige via keyboard.

```html
<!-- Fokus indicator -->
<button class="focus:outline-none focus:ring-2 focus:ring-primary
               focus:ring-offset-2">
  Click Me
</button>
```

### Screen Reader Support

```html
<!-- ARIA labels -->
<button aria-label="Luk dialog">
  <svg><!-- X icon --></svg>
</button>

<!-- Skip navigation link -->
<a href="#main-content" class="sr-only focus:not-sr-only">
  Spring til hovedindhold
</a>
```

---

## Performance

### Page Load Targets

✨ **Forslag**:
- Desktop/Cable: Speed Index < 2.5s
- Mobile/3G: Speed Index < 5s

### Optimization Techniques

1. **Image Optimization**: Brug Next.js Image component
2. **Code Splitting**: Lazy load komponenter
3. **CSS**: Brug Tailwind's purge i production
4. **Fonts**: Brug system fonts (allerede implementeret)

```jsx
import Image from 'next/image'

<Image
  src="/course-image.jpg"
  width={400}
  height={300}
  alt="Kursus billede"
  loading="lazy"
/>
```

---

## Browser Support

### Supported Browsers

⚠️ **Krav**: Fuld support til:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

💡 **Anbefaling**: Basis support til:
- Chrome 80-89
- Firefox 78-87
- Safari 13

### Testing

Test på:
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- Tablet: iPad Safari

---

## Versions Historie

| Version | Dato | Ændringer |
|---------|------|-----------|
| 1.0 | 2025-01-16 | Initial styleguide oprettet |

---

## Kontakt

For spørgsmål om denne styleguide, kontakt udviklingsteamet.
