import { generateId } from '../utils/helpers.js';

export interface WardrobeItem {
  id: string;
  category: string;
  subcategory?: string;
  primary_color?: string;
  secondary_colors?: string;
  pattern?: string;
  style?: string;
  formality?: string;
  season?: string;
  use_cases?: string;
  is_available: number;
  is_favorite: number;
  custom_name?: string;
  [key: string]: any;
}

export interface RecommendationParams {
  items: WardrobeItem[];
  occasion: string;
  style: string;
  weather?: string;
  colorPreference?: string;
  excludeItems?: string[];
  rejectedOutfitIds?: string[];
  rejectedItemSets?: string[][];
  pinterestAesthetics?: string[];
  pinterestColorPalette?: string[];
}

export interface ScoredOutfit {
  items: WardrobeItem[];
  score: number;
  reasons: string[];
  stylingTechnique?: string;
}

// Classical and modern fashion color harmony rules
const COLOR_HARMONY: Record<string, string[]> = {
  black: ['white', 'grey', 'beige', 'charcoal', 'navy', 'cream', 'red', 'olive', 'tan'],
  white: ['black', 'navy', 'blue', 'beige', 'grey', 'brown', 'olive', 'burgundy', 'charcoal'],
  navy: ['white', 'beige', 'cream', 'grey', 'brown', 'tan', 'burgundy', 'olive'],
  grey: ['black', 'white', 'navy', 'blue', 'burgundy', 'charcoal', 'pink'],
  beige: ['navy', 'white', 'brown', 'black', 'olive', 'burgundy', 'cream', 'tan'],
  brown: ['beige', 'cream', 'white', 'navy', 'olive', 'tan', 'black'],
  olive: ['beige', 'cream', 'black', 'white', 'brown', 'navy', 'tan'],
  burgundy: ['navy', 'grey', 'beige', 'cream', 'white', 'black', 'charcoal'],
  blue: ['white', 'beige', 'grey', 'brown', 'navy', 'cream', 'black'],
  charcoal: ['white', 'cream', 'black', 'grey', 'burgundy', 'navy'],
  cream: ['navy', 'black', 'brown', 'olive', 'burgundy', 'beige', 'charcoal'],
  tan: ['navy', 'white', 'brown', 'black', 'olive', 'cream'],
};

// Pinterest researched style aesthetics
const PINTEREST_AESTHETICS: Record<string, { preferredColors: string[]; formalities: string[]; outerSlot: boolean }> = {
  minimalist: {
    preferredColors: ['black', 'white', 'grey', 'beige', 'cream', 'charcoal'],
    formalities: ['casual', 'smart_casual'],
    outerSlot: false,
  },
  streetwear: {
    preferredColors: ['black', 'charcoal', 'grey', 'blue', 'olive', 'white'],
    formalities: ['very_casual', 'casual', 'streetwear'],
    outerSlot: true,
  },
  old_money: {
    preferredColors: ['navy', 'white', 'beige', 'brown', 'cream', 'burgundy'],
    formalities: ['smart_casual', 'business_casual', 'formal'],
    outerSlot: true,
  },
  smart_casual: {
    preferredColors: ['navy', 'white', 'beige', 'grey', 'brown', 'charcoal'],
    formalities: ['smart_casual', 'business_casual'],
    outerSlot: false,
  },
  casual: {
    preferredColors: ['blue', 'black', 'white', 'grey', 'beige', 'olive'],
    formalities: ['very_casual', 'casual', 'smart_casual'],
    outerSlot: false,
  },
  korean: {
    preferredColors: ['black', 'grey', 'cream', 'white', 'beige', 'charcoal'],
    formalities: ['casual', 'smart_casual'],
    outerSlot: true,
  },
  vintage: {
    preferredColors: ['brown', 'tan', 'olive', 'burgundy', 'blue', 'beige'],
    formalities: ['casual', 'smart_casual'],
    outerSlot: true,
  },
};

const OCCASION_FORMALITY: Record<string, string[]> = {
  casual: ['very_casual', 'casual', 'smart_casual'],
  college: ['very_casual', 'casual', 'smart_casual', 'streetwear'],
  work: ['smart_casual', 'business_casual', 'semi_formal'],
  office: ['smart_casual', 'business_casual', 'semi_formal'],
  date_night: ['smart_casual', 'business_casual', 'semi_formal'],
  party: ['smart_casual', 'semi_formal', 'formal', 'streetwear'],
  wedding: ['semi_formal', 'formal'],
  formal_event: ['semi_formal', 'formal'],
  travel: ['very_casual', 'casual', 'smart_casual'],
  sports: ['very_casual', 'casual'],
  everyday: ['very_casual', 'casual', 'smart_casual'],
};

const FORMALITY_ORDER = ['very_casual', 'casual', 'smart_casual', 'business_casual', 'semi_formal', 'formal'];

function getItemSetKey(items: WardrobeItem[]): string {
  return items
    .map((i) => i.id)
    .sort()
    .join(',');
}

export function recommendOutfits(params: RecommendationParams): ScoredOutfit[] {
  const {
    items,
    occasion = 'casual',
    style = 'casual',
    weather = 'mild',
    colorPreference,
    excludeItems = [],
    rejectedItemSets = [],
    pinterestAesthetics = [],
    pinterestColorPalette = [],
  } = params;

  // Filter available and non-excluded items
  const available = items.filter((i) => {
    if (!i.is_available) return false;
    if (excludeItems.includes(i.id)) return false;
    return true;
  });

  // Group by category
  const byCat: Record<string, WardrobeItem[]> = {
    tops: [],
    bottoms: [],
    footwear: [],
    outerwear: [],
    accessories: [],
    dresses: [],
    traditional: [],
  };

  for (const item of available) {
    const cat = item.category.toLowerCase();
    if (byCat[cat]) {
      byCat[cat].push(item);
    } else {
      byCat.tops.push(item);
    }
  }

  // Build rejected keys
  const rejectedKeys = new Set<string>();
  for (const set of rejectedItemSets) {
    rejectedKeys.add([...set].sort().join(','));
  }

  const candidates: ScoredOutfit[] = [];
  const aestheticRule = PINTEREST_AESTHETICS[style.toLowerCase()] || PINTEREST_AESTHETICS.casual;
  const acceptableFormalities = OCCASION_FORMALITY[occasion.toLowerCase()] || OCCASION_FORMALITY.casual;

  // Check if we have Tops + Bottoms or Dresses
  const hasBaseTopsBottoms = byCat.tops.length > 0 && byCat.bottoms.length > 0;
  const hasDresses = byCat.dresses.length > 0;

  if (!hasBaseTopsBottoms && !hasDresses) {
    // If missing bottoms or tops, assemble whatever pieces exist
    if (available.length > 0) {
      return [{
        items: available.slice(0, 3),
        score: 0.7,
        reasons: ['Assembled from your available wardrobe items'],
        stylingTechnique: 'Casual Pairing',
      }];
    }
    return [];
  }

  // Base combinations (Top + Bottom OR Dress)
  const baseCombos: { items: WardrobeItem[]; type: 'two-piece' | 'dress' }[] = [];

  if (hasBaseTopsBottoms) {
    // Pair each top with each bottom (limit to prevent explosion)
    for (const top of byCat.tops.slice(0, 8)) {
      for (const bottom of byCat.bottoms.slice(0, 8)) {
        baseCombos.push({ items: [top, bottom], type: 'two-piece' });
      }
    }
  }

  if (hasDresses) {
    for (const dress of byCat.dresses.slice(0, 6)) {
      baseCombos.push({ items: [dress], type: 'dress' });
    }
  }

  // Now, realistically build COMPLETE outfits:
  // Add Footwear (mandatory for real outfits when available in wardrobe)
  // Optionally add Outerwear (for layering or cool/mild weather)
  // Optionally add Accessories (watches, belts, bags)
  for (const base of baseCombos) {
    const top = base.items[0];
    const bottom = base.items.length > 1 ? base.items[1] : null;

    // Pick best matching footwear from wardrobe
    const footwearList = byCat.footwear.length > 0 ? byCat.footwear : [null];
    const outerwearList = (weather === 'cool' || weather === 'cold' || aestheticRule.outerSlot || occasion === 'work') && byCat.outerwear.length > 0
      ? [null, ...byCat.outerwear.slice(0, 4)]
      : [null];
    const accessoryList = byCat.accessories.length > 0
      ? [null, ...byCat.accessories.slice(0, 3)]
      : [null];

    for (const shoes of footwearList.slice(0, 5)) {
      for (const outer of outerwearList) {
        for (const acc of accessoryList) {
          const combo: WardrobeItem[] = [...base.items];
          if (outer) combo.push(outer);
          if (shoes) combo.push(shoes);
          if (acc) combo.push(acc);

          const key = getItemSetKey(combo);
          if (rejectedKeys.has(key)) continue;

          // ----- Sophisticated Fashion Scoring -----
          let score = 0;
          const reasons: string[] = [];
          let stylingTechnique = 'Classic Balanced Cut';

          const topColor = (top.primary_color || '').toLowerCase();
          const bottomColor = bottom ? (bottom.primary_color || '').toLowerCase() : '';
          const shoeColor = shoes ? (shoes.primary_color || '').toLowerCase() : '';
          const outerColor = outer ? (outer.primary_color || '').toLowerCase() : '';

          // 1. Pinterest "Sandwich Rule" (Top/Outer color matches or coordinates with Footwear)
          let hasSandwich = false;
          if (shoes && topColor && shoeColor) {
            if (topColor === shoeColor && topColor !== bottomColor) {
              score += 0.35;
              hasSandwich = true;
              stylingTechnique = 'Pinterest Color Sandwich (Shoe & Top Matched)';
              reasons.push(`Mastering the Pinterest Sandwich rule: your ${shoeColor} shoes mirror your ${topColor} top.`);
            } else if (outer && outerColor === shoeColor && outerColor !== bottomColor) {
              score += 0.35;
              hasSandwich = true;
              stylingTechnique = 'Layered Sandwiching (Jacket & Shoes Matched)';
              reasons.push(`Clean sandwiching: your ${outerColor} layer pairs seamlessly with your ${shoeColor} footwear.`);
            }
          }

          // 2. Classical Color Harmony (Top with Bottom)
          if (bottomColor) {
            const harmonies = COLOR_HARMONY[topColor] || [];
            if (harmonies.includes(bottomColor)) {
              score += 0.25;
              reasons.push(`Visual balance: ${topColor} complements ${bottomColor} naturally.`);
            } else if (topColor === bottomColor) {
              score += 0.18;
              stylingTechnique = 'Tonal Monochromatic';
              reasons.push(`Tonal monochromatic aesthetic in ${topColor}.`);
            }
          }

          // 3. Pinterest Aesthetic & Moodboard Palette Matching
          const allColors = combo.map((c) => (c.primary_color || '').toLowerCase());
          const paletteToCheck = pinterestColorPalette.length > 0 ? pinterestColorPalette : aestheticRule.preferredColors;
          const matchingPaletteColors = allColors.filter((c) => paletteToCheck.includes(c));

          if (matchingPaletteColors.length >= 2) {
            score += 0.25;
            reasons.push(`Aligned with ${style} Pinterest moodboard palette (${matchingPaletteColors.join(', ')}).`);
          }

          // 4. Formality & Occasion Alignment
          const outfitFormalities = combo.map((c) => (c.formality || 'casual').toLowerCase());
          const matchesOccasion = outfitFormalities.every((f) => acceptableFormalities.includes(f));
          if (matchesOccasion) {
            score += 0.2;
            reasons.push(`Appropriate formality for ${occasion.replace('_', ' ')}.`);
          } else {
            score -= 0.15; // penalty for mixing gym wear with black tie
          }

          // 5. Weather Suitability
          if (weather === 'cold' || weather === 'cool') {
            if (outer) {
              score += 0.15;
              reasons.push(`Layered with outerwear for ${weather} weather.`);
            }
          } else if (weather === 'hot' || weather === 'warm') {
            if (!outer) {
              score += 0.1;
            }
          }

          // 6. User Preferred Color boost
          if (colorPreference && colorPreference !== 'any') {
            if (allColors.includes(colorPreference.toLowerCase())) {
              score += 0.15;
              reasons.push(`Highlights your preferred color: ${colorPreference}.`);
            }
          }

          // 7. Full Outfit Completeness Bonus
          if (shoes && combo.length >= 3) {
            score += 0.15; // Complete head-to-toe look
          }
          if (acc) {
            score += 0.05;
            reasons.push(`Accented with ${acc.subcategory || acc.category}.`);
          }

          candidates.push({
            items: combo,
            score: Math.min(0.99, Math.max(0.65, score)),
            reasons,
            stylingTechnique,
          });
        }
      }
    }
  }

  // Sort descending by styling score
  candidates.sort((a, b) => b.score - a.score);

  // Deduplicate and return top 5 unique, best-researched outfits
  const seenCombos = new Set<string>();
  const topOutfits: ScoredOutfit[] = [];

  for (const cand of candidates) {
    const key = getItemSetKey(cand.items);
    if (!seenCombos.has(key)) {
      seenCombos.add(key);
      topOutfits.push(cand);
      if (topOutfits.length >= 6) break;
    }
  }

  return topOutfits.length > 0 ? topOutfits : candidates.slice(0, 5);
}
