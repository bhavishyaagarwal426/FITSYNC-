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
  season?: string;
  outerwearOption?: 'auto' | 'yes' | 'no';
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
  outerwearPrediction?: {
    included: boolean;
    reason: string;
  };
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

function getItemSetKey(items: WardrobeItem[]): string {
  return items
    .map((i) => i.id)
    .sort()
    .join(',');
}

export function shouldIncludeOuterwear(
  outerwearOption?: string,
  weather?: string,
  season?: string,
  hasOuterwear?: boolean
): { included: boolean; reason: string } {
  if (!hasOuterwear) {
    return { included: false, reason: 'No outerwear pieces found in wardrobe.' };
  }

  // 1. Explicit user request
  if (outerwearOption === 'yes') {
    return { included: true, reason: 'Outerwear requested: Added layer to outfit.' };
  }
  if (outerwearOption === 'no') {
    return { included: false, reason: 'Outerwear excluded as requested.' };
  }

  // 2. Intelligent AI Seasonal / Climate Prediction
  const w = (weather || '').toLowerCase();
  const s = (season || '').toLowerCase();

  const isColdWeather =
    w.includes('cold') ||
    w.includes('rain') ||
    w.includes('snow') ||
    w.includes('cool') ||
    w.includes('winter') ||
    s.includes('winter') ||
    s.includes('autumn') ||
    s.includes('fall');

  if (isColdWeather) {
    return {
      included: true,
      reason: `Predicted for ${w || s || 'cold'} climate: Layered with outerwear for comfort and warmth.`,
    };
  }

  return {
    included: false,
    reason: `Predicted for ${w || s || 'mild'} climate: Keeping silhouette clean without heavy outerwear.`,
  };
}

export function recommendOutfits(params: RecommendationParams): ScoredOutfit[] {
  const {
    items,
    occasion = 'casual',
    style = 'casual',
    weather = 'moderate',
    season = '',
    outerwearOption = 'auto',
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

  // Group by exact category
  const byCat: Record<string, WardrobeItem[]> = {
    tops: [],
    bottoms: [],
    footwear: [],
    outerwear: [],
    accessories: [],
    dresses: [],
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

  const aestheticRule = PINTEREST_AESTHETICS[style.toLowerCase()] || PINTEREST_AESTHETICS.casual;
  const acceptableFormalities = OCCASION_FORMALITY[occasion.toLowerCase()] || OCCASION_FORMALITY.casual;

  // Predict Outerwear
  const outerwearPrediction = shouldIncludeOuterwear(
    outerwearOption,
    weather,
    season,
    byCat.outerwear.length > 0
  );
  const includeOuterwear = outerwearPrediction.included;

  // Check base essentials
  const hasBaseTopsBottoms = byCat.tops.length > 0 && byCat.bottoms.length > 0;
  const hasDresses = byCat.dresses.length > 0;

  if (!hasBaseTopsBottoms && !hasDresses) {
    // If missing bottoms or tops, assemble whatever pieces exist
    if (available.length > 0) {
      return [{
        items: available.slice(0, 4),
        score: 0.7,
        reasons: ['Assembled from available wardrobe items'],
        stylingTechnique: 'Partial Wardrobe Ensemble',
        outerwearPrediction,
      }];
    }
    return [];
  }

  // 1. Mandatory category lists
  // Base combos: 1 top + 1 bottom OR 1 dress
  const baseCombos: { top: WardrobeItem; bottom: WardrobeItem | null; isDress: boolean }[] = [];

  if (hasBaseTopsBottoms) {
    for (const top of byCat.tops.slice(0, 10)) {
      for (const bottom of byCat.bottoms.slice(0, 10)) {
        baseCombos.push({ top, bottom, isDress: false });
      }
    }
  }

  if (hasDresses) {
    for (const dress of byCat.dresses.slice(0, 6)) {
      baseCombos.push({ top: dress, bottom: null, isDress: true });
    }
  }

  // 2. Footwear: Exactly 1 from footwear (if available)
  const footwearChoices: (WardrobeItem | null)[] =
    byCat.footwear.length > 0 ? byCat.footwear.slice(0, 6) : [null];

  // 3. Accessories: Exactly 1 from accessories (if available)
  const accessoryChoices: (WardrobeItem | null)[] =
    byCat.accessories.length > 0 ? byCat.accessories.slice(0, 6) : [null];

  // 4. Outerwear: Exactly 1 from outerwear if includeOuterwear is true, else [null]
  const outerwearChoices: (WardrobeItem | null)[] =
    includeOuterwear && byCat.outerwear.length > 0 ? byCat.outerwear.slice(0, 6) : [null];

  const candidates: ScoredOutfit[] = [];

  // Generate complete head-to-toe combinations
  for (const base of baseCombos) {
    const top = base.top;
    const bottom = base.bottom;

    for (const shoes of footwearChoices) {
      for (const acc of accessoryChoices) {
        for (const outer of outerwearChoices) {
          // Arrange in natural editorial top-to-bottom order:
          // [Outerwear, Top, Bottom, Footwear, Accessories]
          const combo: WardrobeItem[] = [];
          if (outer) combo.push(outer);
          combo.push(top);
          if (bottom) combo.push(bottom);
          if (shoes) combo.push(shoes);
          if (acc) combo.push(acc);

          const key = getItemSetKey(combo);
          if (rejectedKeys.has(key)) continue;

          let score = 0;
          const reasons: string[] = [];
          let stylingTechnique = 'Head-to-Toe Coordinated';

          const topColor = (top.primary_color || '').toLowerCase();
          const bottomColor = bottom ? (bottom.primary_color || '').toLowerCase() : '';
          const shoeColor = shoes ? (shoes.primary_color || '').toLowerCase() : '';
          const outerColor = outer ? (outer.primary_color || '').toLowerCase() : '';
          const accColor = acc ? (acc.primary_color || '').toLowerCase() : '';

          // 1. Pinterest "Sandwich Rule" (Top/Outer color matches or coordinates with Footwear)
          if (shoes && shoeColor) {
            if (topColor && topColor === shoeColor && topColor !== bottomColor) {
              score += 0.35;
              stylingTechnique = 'Pinterest Color Sandwich (Shoe & Top Matched)';
              reasons.push(`Mastering the Pinterest Sandwich rule: your ${shoeColor} footwear mirrors your ${topColor} top.`);
            } else if (outer && outerColor === shoeColor && outerColor !== bottomColor) {
              score += 0.35;
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

          // 3. Accessory Coordination (Watch / Bag / Jewelry)
          if (acc) {
            score += 0.2;
            const accName = acc.custom_name || acc.subcategory || 'accessory';
            if (accColor === 'grey' || accColor === 'silver' || accColor === 'black' || accColor === 'white') {
              reasons.push(`Finished with versatile ${accName}.`);
            } else {
              reasons.push(`Subtle pop of texture with your ${accName}.`);
            }
          }

          // 4. Footwear Grounding
          if (shoes) {
            score += 0.2;
            const shoeName = shoes.custom_name || shoes.subcategory || 'shoes';
            reasons.push(`Grounded with ${shoeName}.`);
          }

          // 5. Outerwear Layering Notes
          if (outer) {
            score += 0.15;
            const outerName = outer.custom_name || outer.subcategory || 'jacket';
            reasons.push(`Structured layer: ${outerName}.`);
          }

          // 6. Pinterest Aesthetic & Moodboard Palette Matching
          const allColors = combo.map((c) => (c.primary_color || '').toLowerCase());
          const paletteToCheck =
            pinterestColorPalette.length > 0 ? pinterestColorPalette : aestheticRule.preferredColors;
          const matchingPaletteColors = allColors.filter((c) => paletteToCheck.includes(c));

          if (matchingPaletteColors.length >= 2) {
            score += 0.25;
            reasons.push(`Aligned with ${style} Pinterest moodboard palette (${matchingPaletteColors.join(', ')}).`);
          }

          // 7. Formality & Occasion Alignment
          const outfitFormalities = combo.map((c) => (c.formality || 'casual').toLowerCase());
          const matchesOccasion = outfitFormalities.every((f) => acceptableFormalities.includes(f));
          if (matchesOccasion) {
            score += 0.15;
          } else {
            score -= 0.1;
          }

          // 8. User Preferred Color boost
          if (colorPreference && colorPreference !== 'any') {
            if (allColors.includes(colorPreference.toLowerCase())) {
              score += 0.15;
              reasons.push(`Features your preferred color accent: ${colorPreference}.`);
            }
          }

          candidates.push({
            items: combo,
            score: Math.min(0.99, Math.max(0.7, score)),
            reasons,
            stylingTechnique,
            outerwearPrediction,
          });
        }
      }
    }
  }

  // Sort descending by styling score
  candidates.sort((a, b) => b.score - a.score);

  // Deduplicate and return top 6 unique, best-researched outfits
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
