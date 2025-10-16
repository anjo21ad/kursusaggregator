# Kursusaggregator Styleguide

Dette dokument definerer designsystemet for kursusaggregator-platformen, inspireret af n8n.io's moderne og professionelle udtryk.

## 🎨 Farvepalette

### Primære farver
| Navn | Hex | Tailwind Custom Name | Anvendelse |
|------|-----|---------------------|------------|
| Primær (orange) | #FF6A3D | `primary` | CTA-knapper, links, fremhævning |
| Primær mørk | #E2572D | `primary-dark` | Hover-tilstande på primære elementer |
| Sekundær (lilla/grå) | #7E6BF1 | `secondary` | Sekundære knapper, accenter |

### Baggrund og kort
| Navn | Hex | Tailwind Custom Name | Anvendelse |
|------|-----|---------------------|------------|
| Baggrund mørk | #0F0F1A | `background` | Hovedbaggrund |
| Kort baggrund | #1C1C2E | `card` | Kort, modaler, opløftede elementer |

### Tekst
| Navn | Hex | Tailwind Custom Name | Anvendelse |
|------|-----|---------------------|------------|
| Tekst lys | #F5F5F7 | `text-light` | Overskrifter, primær tekst |
| Tekst grå | #A0A0B2 | `text-muted` | Sekundær tekst, beskrivelser |

### Accent og status
| Navn | Hex | Tailwind Custom Name | Anvendelse |
|------|-----|---------------------|------------|
| Accent (blå) | #3ABEFF | `accent` | Links, informative elementer |
| Succes grøn | #38D39F | `success` | Succesmeddelelser, positive tilstande |

## ⚙️ Tailwind Konfiguration

Tilføj følgende til din `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#FF6A3D',
        'primary-dark': '#E2572D',
        secondary: '#7E6BF1',
        background: '#0F0F1A',
        card: '#1C1C2E',
        'text-light': '#F5F5F7',
        'text-muted': '#A0A0B2',
        accent: '#3ABEFF',
        success: '#38D39F'
      }
    }
  }
}
```

## ✍️ Typografi

### Font
- **Primær font:** Inter (Google Fonts)
- **Overskrifter:** Fed (700)
- **Brødtekst:** Normal (400)

### Størrelser
| Element | Tailwind klasse | Anvendelse |
|---------|----------------|------------|
| Hero/Headline | `text-3xl` eller `text-4xl` | Hovedoverskrifter |
| Sektionstitler | `text-xl` | Underoverskrifter |
| Brødtekst | `text-base` | Normal tekst |
| Labels | `text-sm` | Form labels, metadata |

### Eksempler
```html
<h1 class="text-4xl font-bold text-text-light">Velkommen til Kursusaggregator</h1>
<p class="text-base text-text-muted">Find kurser til dine medarbejdere</p>
```

## 🔘 Knapper

### Primær knap
```html
<button class="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-colors">
  Kom i gang gratis
</button>
```

### Sekundær knap
```html
<button class="px-5 py-3 rounded-xl bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors">
  Tal med os
</button>
```

### Link-stil
```html
<a class="text-accent hover:underline transition-all">Læs mere</a>
```

## 🧱 Komponenter

### Kursuskort
```html
<div class="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
  <h3 class="text-xl font-semibold text-text-light">Kursusnavn</h3>
  <p class="text-text-muted mt-2">Kort beskrivelse af kurset</p>
  <div class="mt-4 flex justify-between items-center">
    <span class="text-primary font-bold">2.500 kr</span>
    <button class="px-4 py-2 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors">
      Læs mere
    </button>
  </div>
</div>
```

### Hero-sektion
```html
<section class="bg-background py-20">
  <div class="max-w-5xl mx-auto px-6 text-center">
    <h1 class="text-4xl font-bold text-text-light">Din B2B Kursusplatform</h1>
    <p class="text-xl text-text-muted mt-4">Find og administrér kompetenceudvikling ét sted</p>
    <div class="mt-8 flex flex-col sm:flex-row justify-center gap-4">
      <button class="px-6 py-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors">
        Kom i gang
      </button>
      <button class="px-6 py-3 bg-card border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors">
        Tal med os
      </button>
    </div>
  </div>
</section>
```

### Navigationsbar
```html
<nav class="bg-card/80 backdrop-blur-sm border-b border-text-muted/20">
  <div class="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
    <div class="text-2xl font-bold text-text-light">Kursusaggregator</div>
    <div class="hidden md:flex space-x-8">
      <a href="#" class="text-text-muted hover:text-text-light transition-colors">Kurser</a>
      <a href="#" class="text-text-muted hover:text-text-light transition-colors">For Virksomheder</a>
      <a href="#" class="text-text-muted hover:text-text-light transition-colors">Udbydere</a>
    </div>
    <button class="px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary-dark transition-colors">
      Log ind
    </button>
  </div>
</nav>
```

## 🖌️ Ikoner & Detaljer

### Ikoner
- Brug **Lucide React** ikoner (allerede integreret i mange Next.js projekter)
- Farv ikoner med samme farver som tekst: `text-text-light`, `text-text-muted`, `text-primary`

### Gradienter
```html
<!-- Gradient knapper til særlige CTA'er -->
<button class="bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-xl text-white font-semibold">
  Premium funktion
</button>

<!-- Gradient baggrunde til hero-sektioner -->
<div class="bg-gradient-to-br from-background to-card">
  <!-- Indhold -->
</div>
```

## 📐 Layout & Spacing

### Container størrelser
```html
<!-- Standard sektion -->
<section class="max-w-5xl mx-auto px-6 py-12">
  <!-- Indhold -->
</section>

<!-- Fuld bredde sektion med indre container -->
<section class="bg-card py-20">
  <div class="max-w-5xl mx-auto px-6">
    <!-- Indhold -->
  </div>
</section>
```

### Grid layouts
```html
<!-- Kursus grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Kursuskort -->
</div>

<!-- Feature grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
  <!-- Features -->
</div>
```

### Spacing principper
- Brug `gap-6` til kort-grids
- Brug `py-12` til standard sektioner, `py-20` til hero-sektioner
- Brug `mt-4` til mindre afstande, `mt-8` til større
- Brug `rounded-2xl` til kort og større elementer, `rounded-xl` til knapper

## 🎯 Anvendelseseksempler

### Success states
```html
<div class="bg-success/10 border border-success/20 rounded-xl p-4">
  <p class="text-success">Kurset er blevet tilføjet til dine favoritter!</p>
</div>
```

### Loading states
```html
<div class="animate-pulse bg-card rounded-2xl p-6">
  <div class="h-6 bg-text-muted/20 rounded mb-4"></div>
  <div class="h-4 bg-text-muted/20 rounded mb-2"></div>
  <div class="h-4 bg-text-muted/20 rounded w-2/3"></div>
</div>
```

### Form elementer
```html
<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-text-light mb-2">Email</label>
    <input type="email" class="w-full px-4 py-3 bg-card border border-text-muted/20 rounded-xl text-text-light placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary">
  </div>
</div>
```

## 📱 Responsive Design

### Breakpoints
- `sm:` - 640px og op
- `md:` - 768px og op  
- `lg:` - 1024px og op
- `xl:` - 1280px og op

### Responsive eksempler
```html
<!-- Responsive knapper -->
<div class="flex flex-col sm:flex-row gap-4">
  <button>Primær</button>
  <button>Sekundær</button>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <!-- Kort -->
</div>

<!-- Responsive tekst -->
<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold">Overskrift</h1>
```