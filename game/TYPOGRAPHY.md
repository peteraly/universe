# GameOn Typography & Design System

## Typography Implementation

### Font System: Tech-Luxe Sans ✅
- **Primary**: Inter with optimized system fallbacks
- **Fallbacks**: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto
- **Why**: Neutral, precise, polished; excellent screen rendering

### Professional Type Scale
```css
H1: 32px → 40px (mobile → desktop) / lh 1.2 / weight 600 / tracking -0.01em
H2: 24px → 28px / lh 1.25 / 600 / tracking -0.01em  
H3: 20px → 22px / lh 1.3 / 600
Body: 16px / lh 1.5 / 400 (default reading size)
Small: 14px / lh 1.45 / 400
Caption: 12px / lh 1.4 / 500 (use sparingly)
```

### Usage Examples
```jsx
<h1 className="text-h1 text-gray-900">Dashboard</h1>
<h2 className="text-h2 text-gray-900">Events You're Hosting</h2>
<h3 className="text-h3 text-fg">Event Title</h3>
<p className="text-body text-gray-600">Description text</p>
<span className="seat-count text-sm text-gray-600">6/12 seats</span>
```

## Numeric Polish ✅
- **Tabular numbers**: Applied to `.seat-count`, `.numeric`, `[data-numeric]`
- **Font features**: `font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1;`
- **Result**: Even number alignment (6/12, 10/12 align perfectly)

## Motion & Interactions ✅
- **Duration**: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- **Luxury hover**: translateY(-1px) + enhanced shadow
- **Reduced motion**: Honors `prefers-reduced-motion: reduce`
- **Touch targets**: Minimum 44px height

## Focus & Accessibility ✅
- **Focus rings**: 2px accent color ring with offset
- **Touch targets**: ≥44px for all interactive elements
- **ARIA**: Comprehensive labeling throughout
- **Keyboard nav**: Full support with arrow keys for bubbles

## Color Philosophy ✅
- **1 accent + neutral grays**: Clear hierarchy
- **Semantic colors**: Success, warn, error for status only
- **Never accent for status**: Status uses semantic colors only
- **Lane separation**: A (semantic), B (monochrome), C (accent)

## Implementation Notes

### Responsive Typography
- Mobile-first approach with desktop enhancements
- H1 scales from 32px → 40px at 768px+
- Maintains readable line heights across breakpoints

### Design Tokens
- All defined in `tailwind.config.js`
- Easy accent color swapping via CSS variables
- Consistent 8pt grid system
- Professional shadow and radius values

### Quality Checklist ✅
- ✅ One font family in-product (Inter)
- ✅ Headings 600, body 400; no heavy 700s
- ✅ Limited color to accent + grays
- ✅ One obvious primary action per screen
- ✅ No ALL CAPS overuse
- ✅ Minimal borders—spacing does the work
- ✅ Meaningful micro-motions only
- ✅ Tabular numbers for counts
- ✅ Touch-friendly interactions

## A/B Testing Ready
```css
--ab-ring-vs-check: ring; /* Your seat indicator style */
--ab-undo-ms: 5000; /* Undo timer duration */
--ab-pill-none-visible: hidden; /* Show/hide "Not attending" pills */
```

## Performance
- Inter loaded with `font-display: swap` for fast rendering
- Reduced motion respected for accessibility
- Efficient CSS with minimal runtime calculations
- All animations hardware-accelerated where possible

## Next Steps
Visit **http://localhost:3001** to see the polished typography in action:
- Notice the consistent type scale across all screens
- See the tabular numbers in seat counts (6/12, 10/12)
- Feel the luxury hover animations on cards and buttons
- Test keyboard navigation and focus states
