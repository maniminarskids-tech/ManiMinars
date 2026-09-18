import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'everyday-cotton-set',
    name: 'Everyday Cotton Set',
    tagline: 'Ultra-soft 2-piece lounge tee & relaxed jogger pants',
    price: 3450,
    originalPrice: 4200,
    isNew: true,
    isSale: true,
    ageGroup: 'kids',
    category: 'sets',
    sizes: ['1-2Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    colors: [
      {
        name: 'Terracotta Coral',
        hex: '#E84D3D',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Sunny Ochre',
        hex: '#F5BE38',
        image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Sage Olive',
        hex: '#7E9F85',
        image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Engineered for maximum playground freedom, our Everyday Cotton Set is crafted from 100% GOTS-certified combed Pakistani cotton. Features a ribbed round collar, gentle elastic waistband with cotton drawstring, and deep pocket cutouts for little treasures.',
    details: [
      '2-piece matching set: crewneck tee & tapered bottoms',
      'Non-toxic reactive dyes tested for sensitive skin',
      'Reinforced twin-needle stitching at knee seams',
      'Tagless label design to prevent neck itchiness',
    ],
    fabric: '100% Combed Breathable Organic Cotton (210 GSM)',
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: 'rainbow-lounge-dress',
    name: 'Rainbow Lounge Dress',
    tagline: 'Flowy tiers with soft micro-ribbed cuffs',
    price: 2950,
    originalPrice: 3600,
    isSale: true,
    ageGroup: 'kids',
    category: 'dresses',
    sizes: ['2-3Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    colors: [
      {
        name: 'Pastel Sunrise',
        hex: '#F9BC84',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Dusty Rose',
        hex: '#D97A8B',
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'A breezy, twirl-ready silhouette crafted for sunny mornings and playful family gatherings. The relaxed silhouette delivers instant comfort, while subtle colorblock banding creates an elevated modern aesthetic.',
    details: [
      'Breathable drop-waist silhouette with gentle gathered flare',
      'Keyhole back with coconut shell button closure',
      'Pre-shrunk cotton jersey prevents distortion after washing',
      'Concealed side seam pockets',
    ],
    fabric: '100% Organic Cotton Slub Jersey (190 GSM)',
    rating: 4.8,
    reviewCount: 31,
  },
  {
    id: 'mini-explorer-hoodie',
    name: 'Mini Explorer Hoodie',
    tagline: 'Cozy French terry pullover with contrast kangaroo pouch',
    price: 3850,
    isNew: true,
    ageGroup: 'kids',
    category: 'hoodies-jackets',
    sizes: ['1-2Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    colors: [
      {
        name: 'Coral Glow',
        hex: '#E84D3D',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Mustard Sun',
        hex: '#F5BE38',
        image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Deep Navy',
        hex: '#1E293B',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'The quintessential transitional layer. Designed with thick brushed French terry cotton that insulates against cool evening breezes while remaining light and breathable for all-day playground adventures.',
    details: [
      'Double-layered hood with jersey lining',
      'Spacious front kangaroo pocket for warm hands and snacks',
      'Stretchy 2x2 ribbed wrist cuffs and waistband',
      'Embroidered Little Loom kite insignia on left sleeve',
    ],
    fabric: '85% Organic Cotton, 15% Recycled Poly French Terry',
    rating: 5.0,
    reviewCount: 28,
  },
  {
    id: 'weekend-denim-set',
    name: 'Weekend Denim Set',
    tagline: 'Lightweight chambray button-down with soft stretch jeans',
    price: 4650,
    originalPrice: 5500,
    isSale: true,
    ageGroup: 'kids',
    category: 'sets',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    colors: [
      {
        name: 'Indigo Wash',
        hex: '#3B5998',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Washed Stone',
        hex: '#64748B',
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Classic weekend style made exceptionally kid-friendly. We replaced stiff denim with an ultra-lightweight washed indigo chambray shirt and whisper-soft 4-way stretch denim bottoms with adjustable interior button waistbands.',
    details: [
      'Soft-washed non-scratchy indigo treatment',
      'Adjustable internal button-elastic waistband for growing kids',
      'Snap-button placket for effortless dressing',
      'Chest patch pocket with pen stitch detail',
    ],
    fabric: '98% Cotton Chambray & Denim, 2% Elastane',
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: 'soft-knit-cardigan',
    name: 'Soft Knit Cardigan',
    tagline: 'Chunky waffle-knit sweater with eco wooden buttons',
    price: 3950,
    isNew: true,
    ageGroup: 'kids',
    category: 'knitwear',
    sizes: ['1-2Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    colors: [
      {
        name: 'Warm Cream',
        hex: '#F5EFE6',
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Honey Amber',
        hex: '#D99B26',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'A cozy heirloom knit piece designed to be passed down through siblings. Hand-feel soft combed yarn knitted in a breathable textured waffle pattern, finished with sustainably harvested wood button fastenings.',
    details: [
      'Zero-itch combed cotton yarn safe on delicate skin',
      'V-neckline designed for easy layering over collared shirts',
      'Durable ribbed hems hold their shape wash after wash',
      'Machine washable on gentle cycle',
    ],
    fabric: '100% Combed Cotton Yarn (7 Gauge Knit)',
    rating: 4.9,
    reviewCount: 37,
  },
  {
    id: 'party-bloom-frock',
    name: 'Party Bloom Frock',
    tagline: 'Artisanal floral embroidery with tiered organza flair',
    price: 4950,
    originalPrice: 6200,
    isSale: true,
    ageGroup: 'kids',
    category: 'dresses',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '9-10Y'],
    colors: [
      {
        name: 'Coral Petal',
        hex: '#F26B5B',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Golden Blossom',
        hex: '#FAD02C',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Created for birthdays, family weddings, and festive celebratory moments. Features delicate floral vine embroidery along the yoke, fluttering scalloped sleeves, and a 100% soft lawn cotton lining to ensure itch-free celebration.',
    details: [
      'Full 100% breathable pure lawn cotton under-lining',
      'Invisible back zip with protective cotton guard flap',
      'Voluminous gathered skirt with satin edge trim',
      'Handcrafted fabric rosettes at waistline',
    ],
    fabric: 'Embroidered Cotton Jacquard with 100% Lawn Lining',
    rating: 4.9,
    reviewCount: 54,
  },
  {
    id: 'junior-varsity-jacket',
    name: 'Junior Varsity Jacket',
    tagline: 'Modern collegiate bomber with snap front & striped knit trim',
    price: 5950,
    originalPrice: 7200,
    isNew: true,
    isSale: true,
    ageGroup: 'juniors',
    category: 'hoodies-jackets',
    sizes: ['11-12Y', '13-14Y', '15-16Y'],
    colors: [
      {
        name: 'Varsity Maroon & Cream',
        hex: '#8C1D2F',
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Midnight & Gold',
        hex: '#1E293B',
        image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Forest Emerald',
        hex: '#1B4332',
        image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'The centerpiece of the Little Loom Juniors streetwear collection. A crisp modern take on the iconic American varsity jacket, tailored specifically for junior proportions with heavyweight fleece body, contrast faux-leather sleeves, and custom chenille MM badge.',
    details: [
      'Heavyweight 360 GSM fleece body with structured drape',
      'Snap button front closure with reinforced placket',
      'Striped yarn-dyed ribbing on baseball collar, cuffs, and hem',
      'Dual welt hand-warmer exterior pockets and interior phone pocket',
    ],
    fabric: 'Heavyweight Cotton-Poly Fleece & Textured Sleeve Accents',
    rating: 5.0,
    reviewCount: 68,
  },
  {
    id: 'graphic-tee-pack',
    name: 'Graphic Tee Pack',
    tagline: '3-pack boxy drop-shoulder tees with minimalist typography',
    price: 3650,
    isNew: true,
    ageGroup: 'juniors',
    category: 'tops',
    sizes: ['11-12Y', '13-14Y', '15-16Y'],
    colors: [
      {
        name: 'Trio: Coral, White & Charcoal',
        hex: '#E84D3D',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Trio: Mustard, Sand & Olive',
        hex: '#F5BE38',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Value meets premium street styling. A triple pack of contemporary boxy tees cut with lowered shoulder seams, structured crewnecks, and subtle high-density typography screenprints inspired by modern architectural geometry.',
    details: [
      'Pack includes 3 distinct colorways in identical relaxed cut',
      'Pre-washed combed cotton jersey resists pilling and shrinkage',
      'Tight 1x1 rib collar retains structure after multiple washes',
      'Breathable water-based ink graphic prints',
    ],
    fabric: '100% Super-Combed Pakistani Jersey Cotton (220 GSM)',
    rating: 4.8,
    reviewCount: 45,
  },
  {
    id: 'junior-cargo-jogger',
    name: 'Urban Cargo Jogger',
    tagline: 'Relaxed fit with bellows utility pockets and bungee hems',
    price: 4250,
    isNew: false,
    isSale: false,
    ageGroup: 'juniors',
    category: 'bottoms',
    sizes: ['11-12Y', '13-14Y', '15-16Y'],
    colors: [
      {
        name: 'Washed Olive',
        hex: '#4A5B47',
        image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Stealth Black',
        hex: '#1E1E1E',
        image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Functional street style engineered for active teenagers. Cut from durable stretch cotton twill with ergonomic knee articulation, deep pleated cargo pockets with velcro security, and elastic cuffs with toggle adjusters.',
    details: [
      'Heavy-duty 4-way stretch cotton twill weave',
      'Six practical pockets including dual secure side cargo pockets',
      'Elasticized waistband with heavy tubular drawcord',
      'Reinforced seat and crotch gusset for durability',
    ],
    fabric: '97% Cotton Twill, 3% Elastane',
    rating: 4.9,
    reviewCount: 39,
  },
  {
    id: 'junior-oversized-flannel',
    name: 'Oversized Plaid Overshirt',
    tagline: 'Thick brushed cotton twill with double chest flap pockets',
    price: 4450,
    originalPrice: 5200,
    isSale: true,
    ageGroup: 'juniors',
    category: 'tops',
    sizes: ['11-12Y', '13-14Y', '15-16Y'],
    colors: [
      {
        name: 'Ochre & Charcoal Check',
        hex: '#D99B26',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Crimson & Navy Check',
        hex: '#9E2A2B',
        image: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'The ultimate layering essential for juniors. Heavyweight brushed flannel fabric provides warm coverage without bulkiness. Can be styled open over our Graphic Tee Pack or buttoned up for casual dinner outings.',
    details: [
      'Brushed on both sides for supreme softness and warmth',
      'Tortoiseshell patterned resin buttons',
      'Straight hem with slight side vent slits',
      'Adjustable dual button cuff plackets',
    ],
    fabric: '100% Brushed Double-Weave Cotton (240 GSM)',
    rating: 4.8,
    reviewCount: 22,
  },
  {
    id: 'kids-sunflower-linen-dress',
    name: 'Sunflower Linen Tiered Frock',
    tagline: 'Lightweight linen-blend with hand-tied shoulder ribbons',
    price: 3250,
    isNew: true,
    ageGroup: 'kids',
    category: 'dresses',
    sizes: ['1-2Y', '3-4Y', '5-6Y', '7-8Y'],
    colors: [
      {
        name: 'Marigold Yellow',
        hex: '#F5BE38',
        image: 'https://images.unsplash.com/photo-1476493279419-b785d41e38d8?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Milk White',
        hex: '#FDFBF7',
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1476493279419-b785d41e38d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Sunny, breathable, and picture-perfect for summertime trips to Murree or weekend garden brunches. Naturally cooling linen combined with ultra-soft viscose prevents creasing while keeping little ones joyful all day.',
    details: [
      'Adjustable shoulder bows for customized fit as your child grows',
      'Shirred elastic back panel moves naturally with playtime',
      'Fully lined with pure breathable voile cotton',
      'Two hidden side pockets for small treats',
    ],
    fabric: '55% French Flax Linen, 45% Organic Cotton',
    rating: 4.9,
    reviewCount: 29,
  },
  {
    id: 'junior-colorblock-crewneck',
    name: 'Retro Colorblock Pullover',
    tagline: 'Vintage 90s aesthetic with brushed fleece lining',
    price: 3850,
    originalPrice: 4800,
    isSale: true,
    ageGroup: 'juniors',
    category: 'hoodies-jackets',
    sizes: ['11-12Y', '13-14Y', '15-16Y'],
    colors: [
      {
        name: 'Coral, Yellow & Navy',
        hex: '#E84D3D',
        image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Forest & Sand',
        hex: '#1B4332',
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'A standout statement sweatshirt built with geometric diagonal paneling. Features our signature Little Loom Juniors embroidered monogram across the lower hem.',
    details: [
      'Soft brushed fleece interior provides plush comfort',
      'Reinforced collar stitching to prevent stretching',
      'Relaxed unisex junior cut',
      'Colorfast treatment prevents fading after frequent washes',
    ],
    fabric: '80% Pakistani Cotton, 20% Polyester Anti-Pill Fleece',
    rating: 4.7,
    reviewCount: 33,
  },
];

export const CATEGORIES: { id: string; name: string }[] = [
  { id: 'all', name: 'All Pieces' },
  { id: 'sets', name: 'Co-ord Sets' },
  { id: 'dresses', name: 'Dresses & Frocks' },
  { id: 'hoodies-jackets', name: 'Hoodies & Jackets' },
  { id: 'tops', name: 'Tops & Tees' },
  { id: 'bottoms', name: 'Pants & Cargo' },
  { id: 'knitwear', name: 'Knitwear' },
];

export const ALL_SIZES = [
  '0-3M',
  '3-6M',
  '1-2Y',
  '3-4Y',
  '5-6Y',
  '7-8Y',
  '9-10Y',
  '11-12Y',
  '13-14Y',
  '15-16Y',
];

export const KIDS_SIZES = ['1-2Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y'];
export const JUNIORS_SIZES = ['11-12Y', '13-14Y', '15-16Y'];

export const ALL_COLORS = [
  { name: 'Coral Red', hex: '#E84D3D' },
  { name: 'Sunny Yellow', hex: '#F5BE38' },
  { name: 'Olive / Sage', hex: '#7E9F85' },
  { name: 'Denim / Navy', hex: '#1E293B' },
  { name: 'Warm Cream', hex: '#F5EFE6' },
  { name: 'Rose Pink', hex: '#D97A8B' },
  { name: 'Charcoal Black', hex: '#1E1E1E' },
];

export const PRICE_RANGES = [
  { id: 'all', name: 'All Prices' },
  { id: 'under-3000', name: 'Under PKR 3,000', max: 3000 },
  { id: '3000-4500', name: 'PKR 3,000 - 4,500', min: 3000, max: 4500 },
  { id: 'above-4500', name: 'PKR 4,500 & Above', min: 4500 },
];
