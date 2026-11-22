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
  gender?: 'men' | 'women' | 'unisex' | 'all';
  outerwearOption?: 'auto' | 'yes' | 'no';
  colorPreference?: string;
  excludeItems?: string[];
  differentFromItemIds?: string[];
  rejectedOutfitIds?: string[];
  rejectedItemSets?: string[][];
  pinterestAesthetics?: string[];
  pinterestColorPalette?: string[];
  wardrobeOnly?: boolean;
}

export interface ScoredOutfit {
  items: WardrobeItem[];
  score: number;
  reasons: string[];
  stylingTechnique?: string;
  stylingDirective?: string;
  hasCuratedSuggestions?: boolean;
  curatedItemsCount?: number;
  ownedItemsCount?: number;
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
    gender = 'unisex',
    outerwearOption = 'auto',
    colorPreference,
    excludeItems = [],
    differentFromItemIds = [],
    rejectedItemSets = [],
    pinterestAesthetics = [],
    pinterestColorPalette = [],
  } = params;

  const targetGender = (gender || 'unisex').toLowerCase();

  // Filter available, non-excluded, and gender-aligned items
  const available = items.filter((i) => {
    if (!i.is_available) return false;
    if (excludeItems.includes(i.id)) return false;

    const itemGender = (i.gender || 'unisex').toLowerCase();
    const itemCat = (i.category || '').toLowerCase();
    const itemSub = (i.subcategory || '').toLowerCase();

    if (targetGender === 'men') {
      // Men styling excludes explicit women items, dresses, skirts, high heels
      if (itemGender === 'women') return false;
      if (itemCat === 'dresses') return false;
      if (['skirt', 'heels'].includes(itemSub)) return false;
    } else if (targetGender === 'women') {
      // Women styling excludes explicit men items
      if (itemGender === 'men') return false;
    }

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

  // Prioritize user's owned clothes first in each category
  for (const cat of Object.keys(byCat)) {
    byCat[cat].sort((a, b) => {
      const aCurated = (a.is_curated || a.user_id === 'system-curated') ? 1 : 0;
      const bCurated = (b.is_curated || b.user_id === 'system-curated') ? 1 : 0;
      return aCurated - bCurated;
    });
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

          // Stylist Realism Filter: Prevent jarring formality clashes
          const topSub = (top.subcategory || '').toLowerCase();
          const bottomSub = bottom ? (bottom.subcategory || '').toLowerCase() : '';
          const shoeSub = shoes ? (shoes.subcategory || '').toLowerCase() : '';

          // Hard Rule: Never combine formal dress shoes with athletic sweatpants or gym shorts
          if (['dress-shoes', 'oxford', 'derby', 'heels'].includes(shoeSub) && ['sweatpants', 'joggers', 'shorts'].includes(bottomSub)) {
            continue;
          }
          // Hard Rule: Never combine formal blazers or dress shirts with athletic sweatpants or shorts
          if (['blazer', 'dress-shirt'].includes(topSub) && ['sweatpants', 'joggers', 'shorts'].includes(bottomSub)) {
            continue;
          }

          let score = 0;
          const reasons: string[] = [];
          let stylingTechnique = 'Head-to-Toe Coordinated';

          const ownedCount = combo.filter((i) => !i.is_curated && i.user_id !== 'system-curated').length;
          const curatedCount = combo.length - ownedCount;

          // Wardrobe Affinity: reward using owned clothes (+0.10 per owned piece)
          score += ownedCount * 0.10;

          // Gender styling alignment
          if (targetGender === 'women') {
            if (base.isDress) {
              score += 0.25;
              stylingTechnique = 'Chic Feminine Silhouette (Statement Dress)';
              reasons.push('Feminine styling: styled around an elegant dress centerpiece.');
            } else if (bottomSub === 'skirt') {
              score += 0.20;
              stylingTechnique = 'Refined Feminine Ensemble (Flowing Skirt)';
              reasons.push('Feminine styling: elevated with a tailored skirt silhouette.');
            }
            const womenMatches = combo.filter((i) => (i.gender || '').toLowerCase() === 'women').length;
            score += womenMatches * 0.08;
          } else if (targetGender === 'men') {
            const menMatches = combo.filter((i) => (i.gender || '').toLowerCase() === 'men').length;
            score += menMatches * 0.08;
          }

          if (curatedCount > 0) {
            stylingTechnique = 'Hybrid Curated Bundle (Wardrobe + Shoppable Picks)';
            const curatedItems = combo.filter((i) => i.is_curated || i.user_id === 'system-curated');
            reasons.push(`Enhanced with ${curatedItems.length} curated shoppable piece${curatedItems.length > 1 ? 's' : ''} to complete the lookbook.`);
          }

          // Diversity & Big Change against previous outfit (when user requests "Try Another Combo")
          const diffItemSet = new Set(differentFromItemIds);
          if (diffItemSet.size > 0) {
            let overlapCount = 0;
            for (const it of combo) {
              if (diffItemSet.has(it.id)) {
                overlapCount++;
              }
            }

            if (overlapCount >= 2) {
              // Core pieces repeated from previous look - apply heavy penalty
              score -= 0.85;
            } else if (overlapCount === 1) {
              // 1 item shared (e.g. footwear), but top, bottom/dress & accessories are new
              score += 0.25;
              stylingTechnique = 'High-Contrast Reimagining (Anchor Pieces Rotated)';
              reasons.push('Noticeable transformation: core silhouette and styling anchors rotated for a fresh aesthetic.');
            } else if (overlapCount === 0) {
              // 100% brand new pieces across every category!
              score += 0.50;
              stylingTechnique = 'Dramatic Fresh Alternative (100% Distinct Ensemble)';
              reasons.push('Dramatic fresh alternative: completely different garments, color palette, and styling silhouette.');
            }

            // Direct garment category rotation: penalize reusing the exact same anchor top or bottom
            if (diffItemSet.has(top.id)) {
              score -= 0.45;
            }
            if (bottom && diffItemSet.has(bottom.id)) {
              score -= 0.45;
            }
          }

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

          // 2. Leather & Hardware Synergy (Footwear & Timepiece / Accessories)
          if (shoes && acc) {
            const isWarmShoes = ['brown', 'tan', 'beige'].includes(shoeColor);
            const isWarmAcc = ['brown', 'tan', 'gold', 'beige'].includes(accColor);
            const isCoolShoes = ['black', 'charcoal', 'grey', 'white'].includes(shoeColor);
            const isCoolAcc = ['black', 'charcoal', 'grey', 'silver', 'white'].includes(accColor);

            if (isWarmShoes && isWarmAcc) {
              score += 0.30;
              stylingTechnique = 'Earth Tone Leather Synergy';
              reasons.push('Hardware & Leather Synergy: Warm footwear synchronizes flawlessly with your earth-toned timepiece.');
            } else if (isCoolShoes && isCoolAcc) {
              score += 0.25;
              reasons.push('Monochrome Hardware Synergy: Clean timepiece coordinates effortlessly with your footwear tones.');
            }
          }

          // 3. Golden 60-30-10 Aesthetic Styling Rule
          const isNeutralBottom = ['black', 'navy', 'beige', 'grey', 'charcoal', 'white', 'cream', 'blue'].includes(bottomColor);
          if (isNeutralBottom && topColor && topColor !== bottomColor) {
            score += 0.25;
            reasons.push('Structured by the 60-30-10 rule: versatile neutral base accented by purposeful top layering.');
          }

          // 4. Classical Color Harmony (Top with Bottom)
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

          // 5. Accessory Coordination (Watch / Bag / Jewelry)
          if (acc) {
            score += 0.2;
            const accName = acc.custom_name || acc.subcategory || 'accessory';
            if (accColor === 'grey' || accColor === 'silver' || accColor === 'black' || accColor === 'white') {
              reasons.push(`Finished with versatile ${accName}.`);
            } else {
              reasons.push(`Subtle pop of texture with your ${accName}.`);
            }
          }

          // 6. Footwear Grounding
          if (shoes) {
            score += 0.2;
            const shoeName = shoes.custom_name || shoes.subcategory || 'shoes';
            reasons.push(`Grounded with ${shoeName}.`);
          }

          // 7. Outerwear Layering Notes
          if (outer) {
            score += 0.15;
            const outerName = outer.custom_name || outer.subcategory || 'jacket';
            reasons.push(`Structured layer: ${outerName}.`);
          }

          // 8. Pinterest Aesthetic & Moodboard Palette Matching
          const allColors = combo.map((c) => (c.primary_color || '').toLowerCase());
          const paletteToCheck =
            pinterestColorPalette.length > 0 ? pinterestColorPalette : aestheticRule.preferredColors;
          const matchingPaletteColors = allColors.filter((c) => paletteToCheck.includes(c));

          if (matchingPaletteColors.length >= 2) {
            score += 0.25;
            reasons.push(`Aligned with ${style} Pinterest moodboard palette (${matchingPaletteColors.join(', ')}).`);
          }

          // 9. Formality & Occasion Alignment
          const outfitFormalities = combo.map((c) => (c.formality || 'casual').toLowerCase());
          const matchesOccasion = outfitFormalities.every((f) => acceptableFormalities.includes(f));
          if (matchesOccasion) {
            score += 0.15;
          } else {
            score -= 0.1;
          }

          // 10. User Preferred Color boost
          if (colorPreference && colorPreference !== 'any') {
            if (allColors.includes(colorPreference.toLowerCase())) {
              score += 0.15;
              reasons.push(`Features your preferred color accent: ${colorPreference}.`);
            }
          }

          // Actionable Editorial Stylist Directive
          let stylingDirective = 'Keep the silhouette effortless and proportional.';
          if (topSub.includes('shirt') || topSub.includes('polo')) {
            stylingDirective = 'Execute a gentle French tuck at the front waistband to define waistline proportions. Push sleeves up slightly past the wrist to showcase your timepiece.';
          } else if (topSub.includes('t-shirt') || topSub.includes('tee')) {
            stylingDirective = 'Cuff the trouser hem cleanly above the footwear to showcase shoe profile and maintain a crisp, modern street silhouette.';
          } else if (outer) {
            stylingDirective = 'Keep outerwear unzipped to expose the inner tonal contrast, creating a flattering vertical slimming line.';
          }

          candidates.push({
            items: combo,
            score: Math.min(0.99, Math.max(0.7, score)),
            reasons,
            stylingTechnique,
            stylingDirective,
            hasCuratedSuggestions: curatedCount > 0,
            curatedItemsCount: curatedCount,
            ownedItemsCount: ownedCount,
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
