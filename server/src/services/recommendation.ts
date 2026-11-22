import { generateId } from '../utils/helpers.js';

interface WardrobeItem {
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

interface RecommendationParams {
  items: WardrobeItem[];
  occasion: string;
  style: string;
  weather?: string;
  colorPreference?: string;
  excludeItems?: string[];
  rejectedOutfitIds?: string[];
  rejectedItemSets?: string[][];
}

interface ScoredOutfit {
  items: WardrobeItem[];
  score: number;
  reasons: string[];
}

// Category compatibility rules – which categories can combine into an outfit
const OUTFIT_TEMPLATES: { required: string[]; optional: string[] }[] = [
  { required: ['tops', 'bottoms'], optional: ['outerwear', 'footwear', 'accessories'] },
  { required: ['dresses'], optional: ['outerwear', 'footwear', 'accessories'] },
];

const OCCASION_FORMALITY: Record<string, string[]> = {
  casual: ['very_casual', 'casual', 'smart_casual'],
  work: ['smart_casual', 'business_casual', 'semi_formal'],
  date_night: ['smart_casual', 'business_casual', 'semi_formal'],
  party: ['smart_casual', 'semi_formal', 'formal'],
  formal_event: ['semi_formal', 'formal'],
  sports: ['very_casual', 'casual'],
  travel: ['very_casual', 'casual', 'smart_casual'],
  everyday: ['very_casual', 'casual', 'smart_casual'],
  beach: ['very_casual', 'casual'],
  outdoor: ['very_casual', 'casual', 'smart_casual'],
};

const WEATHER_SEASON: Record<string, string[]> = {
  hot: ['summer', 'all'],
  warm: ['spring', 'summer', 'all'],
  mild: ['spring', 'autumn', 'all'],
  cool: ['autumn', 'winter', 'all'],
  cold: ['winter', 'all'],
  rainy: ['autumn', 'spring', 'all'],
};

const COLOR_HARMONY: Record<string, string[]> = {
  black: ['white', 'grey', 'red', 'navy', 'cream', 'beige', 'charcoal'],
  white: ['black', 'navy', 'blue', 'grey', 'beige', 'brown', 'red'],
  navy: ['white', 'cream', 'beige', 'grey', 'brown', 'tan', 'burgundy'],
  grey: ['black', 'white', 'navy', 'blue', 'pink', 'burgundy', 'charcoal'],
  beige: ['navy', 'brown', 'white', 'olive', 'burgundy', 'cream', 'tan'],
  brown: ['beige', 'cream', 'white', 'olive', 'navy', 'tan', 'green'],
  olive: ['beige', 'cream', 'brown', 'white', 'tan', 'navy', 'black'],
  burgundy: ['navy', 'grey', 'beige', 'cream', 'white', 'black', 'charcoal'],
  blue: ['white', 'grey', 'beige', 'brown', 'navy', 'cream'],
  red: ['black', 'white', 'grey', 'navy', 'charcoal'],
  green: ['beige', 'brown', 'cream', 'white', 'navy', 'tan'],
  pink: ['grey', 'navy', 'white', 'black', 'cream'],
  cream: ['navy', 'brown', 'olive', 'burgundy', 'beige', 'charcoal', 'black'],
  charcoal: ['white', 'cream', 'burgundy', 'blue', 'grey', 'pink'],
  tan: ['navy', 'white', 'brown', 'olive', 'cream', 'beige'],
};

const FORMALITY_ORDER = ['very_casual', 'casual', 'smart_casual', 'business_casual', 'semi_formal', 'formal'];

function parseJsonField(val: string | undefined): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

function formalityDistance(a: string, b: string): number {
  const ia = FORMALITY_ORDER.indexOf(a);
  const ib = FORMALITY_ORDER.indexOf(b);
  if (ia < 0 || ib < 0) return 2;
  return Math.abs(ia - ib);
}

function scoreColorCoordination(items: WardrobeItem[]): number {
  const colors = items.map((i) => i.primary_color).filter(Boolean) as string[];
  if (colors.length <= 1) return 1;

  let pairs = 0;
  let harmonious = 0;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      pairs++;
      const ha = COLOR_HARMONY[colors[i]];
      if (ha && ha.includes(colors[j])) harmonious++;
      else if (colors[i] === colors[j]) harmonious += 0.7; // monochrome ok but less interesting
    }
  }
  return pairs > 0 ? harmonious / pairs : 0.5;
}

function scoreStyleMatch(items: WardrobeItem[], targetStyle: string): number {
  const matches = items.filter((i) => i.style === targetStyle).length;
  return items.length > 0 ? matches / items.length : 0;
}

function scoreOccasion(items: WardrobeItem[], occasion: string): number {
  const acceptableFormality = OCCASION_FORMALITY[occasion] || OCCASION_FORMALITY.casual;
  const matches = items.filter((i) => i.formality && acceptableFormality.includes(i.formality)).length;
  return items.length > 0 ? matches / items.length : 0.5;
}

function scoreWeather(items: WardrobeItem[], weather: string): number {
  if (!weather) return 0.5;
  const acceptableSeasons = WEATHER_SEASON[weather] || ['all'];
  const matches = items.filter((i) => i.season && acceptableSeasons.includes(i.season)).length;
  return items.length > 0 ? matches / items.length : 0.5;
}

function scoreFormalityConsistency(items: WardrobeItem[]): number {
  const formalities = items.map((i) => i.formality).filter(Boolean) as string[];
  if (formalities.length <= 1) return 1;
  let totalDist = 0;
  let pairs = 0;
  for (let i = 0; i < formalities.length; i++) {
    for (let j = i + 1; j < formalities.length; j++) {
      totalDist += formalityDistance(formalities[i], formalities[j]);
      pairs++;
    }
  }
  const avgDist = totalDist / pairs;
  return Math.max(0, 1 - avgDist / 3);
}

function scoreColorPreference(items: WardrobeItem[], colorPref?: string): number {
  if (!colorPref) return 0.5;
  const has = items.some((i) => i.primary_color === colorPref);
  return has ? 1 : 0;
}

function getItemSetKey(items: WardrobeItem[]): string {
  return items
    .map((i) => i.id)
    .sort()
    .join(',');
}

export function recommendOutfits(params: RecommendationParams): ScoredOutfit[] {
  const { items, occasion, style, weather, colorPreference, excludeItems, rejectedItemSets } = params;

  // Filter to available, non-excluded items
  const available = items.filter((i) => {
    if (!i.is_available) return false;
    if (excludeItems && excludeItems.includes(i.id)) return false;
    return true;
  });

  // Group by category
  const byCategory: Record<string, WardrobeItem[]> = {};
  for (const item of available) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  }

  // Build rejected set keys for quick lookup
  const rejectedKeys = new Set<string>();
  if (rejectedItemSets) {
    for (const set of rejectedItemSets) {
      rejectedKeys.add([...set].sort().join(','));
    }
  }

  const candidates: ScoredOutfit[] = [];

  for (const template of OUTFIT_TEMPLATES) {
    // Check if we have items for all required categories
    const hasAll = template.required.every((cat) => byCategory[cat] && byCategory[cat].length > 0);
    if (!hasAll) continue;

    // Generate combinations for required categories
    const requiredLists = template.required.map((cat) => byCategory[cat]);
    const optionalLists = template.optional
      .filter((cat) => byCategory[cat] && byCategory[cat].length > 0)
      .map((cat) => byCategory[cat]);

    // Cartesian product of required categories (limit to prevent explosion)
    let combos: WardrobeItem[][] = [[]];
    for (const list of requiredLists) {
      const next: WardrobeItem[][] = [];
      const limited = list.slice(0, 15); // limit to prevent exponential blowup
      for (const combo of combos) {
        for (const item of limited) {
          next.push([...combo, item]);
        }
      }
      combos = next;
    }

    // For each required combo, optionally add one item from each optional category
    const expanded: WardrobeItem[][] = [];
    for (const combo of combos) {
      // Base combo (no optional items)
      expanded.push(combo);

      // Add one item from each optional category (pick the best-scoring one later is expensive,
      // so we pick randomly or the first few)
      for (const optList of optionalLists) {
        const best = optList[0]; // just pick first; scoring will rank them
        if (best && expanded.length < 500) {
          expanded.push([...combo, best]);
        }
      }
    }

    // Score each combination
    for (const combo of expanded) {
      const key = getItemSetKey(combo);
      if (rejectedKeys.has(key)) continue;

      const colorScore = scoreColorCoordination(combo);
      const styleScore = scoreStyleMatch(combo, style);
      const occasionScore = scoreOccasion(combo, occasion);
      const weatherScore = scoreWeather(combo, weather || '');
      const formalityScore = scoreFormalityConsistency(combo);
      const colorPrefScore = scoreColorPreference(combo, colorPreference);

      const score =
        colorScore * 0.2 +
        styleScore * 0.25 +
        occasionScore * 0.2 +
        weatherScore * 0.1 +
        formalityScore * 0.15 +
        colorPrefScore * 0.1;

      const reasons: string[] = [];
      if (colorScore > 0.6) reasons.push('Great color coordination');
      if (styleScore > 0.6) reasons.push(`Matches ${style} style`);
      if (occasionScore > 0.6) reasons.push(`Appropriate for ${occasion}`);
      if (weatherScore > 0.6 && weather) reasons.push(`Suitable for ${weather} weather`);
      if (formalityScore > 0.8) reasons.push('Consistent formality level');
      if (colorPrefScore > 0.5 && colorPreference) reasons.push(`Includes your preferred color: ${colorPreference}`);

      candidates.push({ items: combo, score, reasons });
    }
  }

  // Sort by score descending, return top results
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 5);
}
