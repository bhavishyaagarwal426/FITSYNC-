import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

export interface ClothingAnalysis {
  category: string;
  subcategory: string;
  primaryColor: string;
  secondaryColors: string[];
  pattern: string;
  texture: string;
  material: string;
  style: string;
  formality: string;
  season: string;
  useCases: string[];
  confidence: number;
}

export interface AIProvider {
  analyzeClothing(imagePath: string, originalFilename?: string, userHintCategory?: string): Promise<ClothingAnalysis>;
  generateOutfitExplanation(items: any[], occasion: string, style: string): Promise<string>;
}

// ----- Perceptual Image Hashing & Duplicate Detection -----

export async function computeDHash(imagePath: string): Promise<string> {
  const buffer = await sharp(imagePath)
    .resize(9, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  let hash = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = buffer[y * 9 + x];
      const right = buffer[y * 9 + (x + 1)];
      hash += left > right ? '1' : '0';
    }
  }
  return hash;
}

export function hammingDistance(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== h2.length) return 64;
  let dist = 0;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) dist++;
  }
  return dist;
}

// ----- Intelligent Local Vision & Heuristics Engine -----

export class SmartLocalVisionProvider implements AIProvider {
  async analyzeClothing(
    imagePath: string,
    originalFilename = '',
    userHintCategory?: string
  ): Promise<ClothingAnalysis> {
    let width = 500;
    let height = 500;
    let rMean = 128;
    let gMean = 128;
    let bMean = 128;
    let rStdev = 20;

    // 1. Analyze pixels and dimensions with Sharp
    try {
      if (fs.existsSync(imagePath)) {
        const image = sharp(imagePath);
        const meta = await image.metadata();
        width = meta.width || 500;
        height = meta.height || 500;

        const stats = await image.stats();
        if (stats.channels && stats.channels.length >= 3) {
          rMean = Math.round(stats.channels[0].mean);
          gMean = Math.round(stats.channels[1].mean);
          bMean = Math.round(stats.channels[2].mean);
          rStdev = Math.round(stats.channels[0].stdev);
        }
      }
    } catch (err) {
      console.warn('Sharp analysis error in AI vision:', err);
    }

    const aspectRatio = height / (width || 1);
    const morphology = await this.extractMorphology(imagePath);

    // 2. Detect color from image channels
    let primaryColor = this.detectColor(rMean, gMean, bMean);
    const secondaryColors = this.detectSecondaryColors(primaryColor, rMean, gMean, bMean);

    // 3. NLP keyword analysis from filename
    const cleanName = (originalFilename || path.basename(imagePath))
      .toLowerCase()
      .replace(/([0-9]+)/g, ' $1 ')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ');

    // Color override if filename explicitly specifies color (e.g. "black hoodie", "brown boots", "white shirt")
    if (/\b(black|noir|nero)\b/i.test(cleanName)) primaryColor = 'black';
    else if (/\b(white|blanc|bianco)\b/i.test(cleanName)) primaryColor = 'white';
    else if (/\b(navy|dark blue)\b/i.test(cleanName)) primaryColor = 'navy';
    else if (/\b(blue|denim|indigo)\b/i.test(cleanName)) primaryColor = 'blue';
    else if (/\b(beige|tan|khaki|cream)\b/i.test(cleanName)) primaryColor = 'beige';
    else if (/\b(brown|marron)\b/i.test(cleanName)) primaryColor = 'brown';
    else if (/\b(grey|gray|charcoal)\b/i.test(cleanName)) primaryColor = 'grey';
    else if (/\b(olive|army green)\b/i.test(cleanName)) primaryColor = 'olive';
    else if (/\b(green|emerald)\b/i.test(cleanName)) primaryColor = 'green';
    else if (/\b(burgundy|maroon|wine)\b/i.test(cleanName)) primaryColor = 'burgundy';
    else if (/\b(red|crimson)\b/i.test(cleanName)) primaryColor = 'red';

    let category = '';
    let subcategory = '';
    let material = 'cotton';
    let style = 'casual';
    let formality = 'casual';
    let pattern = rStdev > 48 ? 'patterned' : 'solid';
    let texture = 'smooth';
    let season = 'all';
    let useCases = ['casual', 'everyday'];
    let confidence = 0.95;

    // Check Accessories first (prioritize watches, belts, glasses, bags, jewelry)
    if (
      /\b(watch|watches|chrono|chronograph|rolex|casio|omega|seiko|timepiece|dial|smartwatch|wrist|strap|apple watch|g shock|tissot|fossil)\b/i.test(cleanName)
    ) {
      category = 'accessories';
      subcategory = 'watch';
      material = 'metal';
      style = 'smart_casual';
      formality = 'smart_casual';
      useCases = ['work', 'everyday', 'date_night'];
      confidence = 0.98;
    } else if (/\b(sunglass|sunglasses|glasses|shades|spectacles|eyewear|ray ban|oakley)\b/i.test(cleanName)) {
      category = 'accessories';
      subcategory = 'sunglasses';
      material = 'acetate';
      style = 'streetwear';
      formality = 'casual';
      useCases = ['outdoor', 'casual', 'travel'];
      confidence = 0.96;
    } else if (/\b(belt|buckle)\b/i.test(cleanName)) {
      category = 'accessories';
      subcategory = 'belt';
      material = 'leather';
      formality = 'smart_casual';
      confidence = 0.95;
    } else if (/\b(hat|cap|beanie|fedora|beret|bucket hat)\b/i.test(cleanName)) {
      category = 'accessories';
      subcategory = 'hat';
      material = 'cotton';
      style = 'streetwear';
      confidence = 0.95;
    } else if (/\b(bag|tote|backpack|handbag|clutch|wallet|purse|duffle)\b/i.test(cleanName)) {
      category = 'accessories';
      subcategory = 'bag';
      material = 'leather';
      useCases = ['work', 'travel', 'everyday'];
      confidence = 0.95;
    } else if (/\b(ring|necklace|bracelet|chain|pendant|earring|earrings|jewelry|jewellery)\b/i.test(cleanName)) {
      category = 'accessories';
      subcategory = 'jewelry';
      material = 'silver';
      formality = 'formal';
      confidence = 0.96;
    } else if (/\b(scarf|muffler)\b/i.test(cleanName)) {
      category = 'accessories';
      subcategory = 'scarf';
      material = 'wool';
      season = 'winter';
      confidence = 0.95;
    }
    // Check Footwear
    else if (/\b(shoe|shoes|sneaker|sneakers|kicks|trainer|trainers|jordan|yeezy|nike|adidas|vans|converse|running)\b/i.test(cleanName)) {
      category = 'footwear';
      subcategory = 'sneakers';
      material = 'leather';
      style = 'casual';
      useCases = ['casual', 'everyday', 'sports'];
      confidence = 0.97;
    } else if (/\b(boot|boots|chelsea|combat|timberland)\b/i.test(cleanName)) {
      category = 'footwear';
      subcategory = 'boots';
      material = 'leather';
      style = 'streetwear';
      season = 'autumn';
      confidence = 0.96;
    } else if (/\b(loafer|loafers|moccasin)\b/i.test(cleanName)) {
      category = 'footwear';
      subcategory = 'loafers';
      material = 'leather';
      style = 'smart_casual';
      formality = 'smart_casual';
      confidence = 0.96;
    } else if (/\b(sandal|sandals|slide|slides|flip flop|birkenstock)\b/i.test(cleanName)) {
      category = 'footwear';
      subcategory = 'sandals';
      material = 'synthetic';
      season = 'summer';
      confidence = 0.95;
    } else if (/\b(heel|heels|stiletto|pump|pumps)\b/i.test(cleanName)) {
      category = 'footwear';
      subcategory = 'heels';
      formality = 'formal';
      useCases = ['formal_event', 'party', 'date_night'];
      confidence = 0.96;
    } else if (/\b(oxford|derby|brogue|dress shoe)\b/i.test(cleanName)) {
      category = 'footwear';
      subcategory = 'dress-shoes';
      material = 'leather';
      formality = 'formal';
      confidence = 0.96;
    }
    // Check Bottoms
    else if (/\b(jean|jeans|denim|baggy jean|straight fit|skinny jean)\b/i.test(cleanName)) {
      category = 'bottoms';
      subcategory = 'jeans';
      material = 'denim';
      texture = 'denim';
      style = 'casual';
      confidence = 0.97;
    } else if (/\b(chino|chinos|khaki|khakis)\b/i.test(cleanName)) {
      category = 'bottoms';
      subcategory = 'chinos';
      material = 'cotton';
      style = 'smart_casual';
      formality = 'smart_casual';
      confidence = 0.96;
    } else if (/\b(trouser|trousers|pant|pants|slacks|tailored pant)\b/i.test(cleanName)) {
      category = 'bottoms';
      subcategory = 'trousers';
      material = 'wool';
      style = 'formal';
      formality = 'formal';
      confidence = 0.95;
    } else if (/\b(short|shorts|bermuda)\b/i.test(cleanName)) {
      category = 'bottoms';
      subcategory = 'shorts';
      season = 'summer';
      confidence = 0.95;
    } else if (/\b(jogger|joggers|sweatpant|sweatpants|trackpant)\b/i.test(cleanName)) {
      category = 'bottoms';
      subcategory = 'joggers';
      material = 'fleece';
      style = 'sporty';
      confidence = 0.96;
    } else if (/\b(cargo|cargos)\b/i.test(cleanName)) {
      category = 'bottoms';
      subcategory = 'cargo-pants';
      style = 'streetwear';
      confidence = 0.95;
    } else if (/\b(skirt|skirts)\b/i.test(cleanName)) {
      category = 'bottoms';
      subcategory = 'skirt';
      confidence = 0.95;
    }
    // Check Outerwear
    else if (/\b(hoodie|hoodies)\b/i.test(cleanName)) {
      category = 'outerwear';
      subcategory = 'hoodie';
      material = 'cotton';
      style = 'streetwear';
      season = 'winter';
      useCases = ['casual', 'everyday'];
      confidence = 0.97;
    } else if (/\b(jacket|jackets|bomber|windbreaker|puffer|biker)\b/i.test(cleanName)) {
      category = 'outerwear';
      subcategory = 'jacket';
      material = 'nylon';
      style = 'casual';
      season = 'autumn';
      confidence = 0.96;
    } else if (/\b(blazer|suit jacket)\b/i.test(cleanName)) {
      category = 'outerwear';
      subcategory = 'blazer';
      material = 'wool';
      style = 'formal';
      formality = 'formal';
      useCases = ['work', 'formal_event'];
      confidence = 0.97;
    } else if (/\b(coat|overcoat|trench|parka|peacoat)\b/i.test(cleanName)) {
      category = 'outerwear';
      subcategory = 'coat';
      material = 'wool';
      season = 'winter';
      confidence = 0.96;
    } else if (/\b(cardigan)\b/i.test(cleanName)) {
      category = 'outerwear';
      subcategory = 'cardigan';
      material = 'knit';
      confidence = 0.95;
    } else if (/\b(vest|waistcoat)\b/i.test(cleanName)) {
      category = 'outerwear';
      subcategory = 'vest';
      confidence = 0.94;
    }
    // Check Tops
    else if (/\b(polo)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 'polo';
      formality = 'smart_casual';
      confidence = 0.97;
    } else if (/\b(t shirt|tshirt|tee|tees|graphic tee)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 't-shirt';
      confidence = 0.97;
    } else if (/\b(shirt|oxford|button down|dress shirt)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 'dress-shirt';
      formality = 'smart_casual';
      confidence = 0.96;
    } else if (/\b(sweater|sweaters|knit|pullover)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 'sweater';
      material = 'wool';
      texture = 'knit';
      season = 'winter';
      confidence = 0.96;
    } else if (/\b(sweatshirt)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 'sweatshirt';
      material = 'fleece';
      confidence = 0.96;
    } else if (/\b(blouse)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 'blouse';
      material = 'silk';
      confidence = 0.95;
    } else if (/\b(tank|tank top|camisole)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 'tank-top';
      season = 'summer';
      confidence = 0.95;
    } else if (/\b(henley)\b/i.test(cleanName)) {
      category = 'tops';
      subcategory = 'henley';
      confidence = 0.95;
    }
    // Check Dresses
    else if (/\b(dress|gown|maxi|sundress|frock|wrap dress)\b/i.test(cleanName)) {
      category = 'dresses';
      subcategory = 'casual-dress';
      confidence = 0.96;
    }
    // Check Traditional
    else if (/\b(kurta|kurti|sherwani|saree|sari|lehenga|salwar|dupatta|kaftan|traditional)\b/i.test(cleanName)) {
      category = 'traditional';
      subcategory = 'traditional-wear';
      material = 'silk';
      formality = 'formal';
      confidence = 0.96;
    }

    // 4. Fallback using userHint or Visual Geometry (morphology & color channels)
    if (!category) {
      if (userHintCategory && ['tops', 'bottoms', 'footwear', 'outerwear', 'accessories', 'dresses', 'traditional'].includes(userHintCategory.toLowerCase())) {
        category = userHintCategory.toLowerCase();
        subcategory = category === 'accessories' ? 'watch' : category === 'footwear' ? 'sneakers' : category === 'bottoms' ? 'trousers' : 't-shirt';
        confidence = 0.95;
      } else if (morphology.isSymmetricStrap) {
        // Watch / Timepiece with symmetric strap profile (narrow top/bottom strap, central dial)
        category = 'accessories';
        subcategory = 'watch';
        material = 'metal';
        style = 'smart_casual';
        formality = 'smart_casual';
        useCases = ['work', 'everyday', 'date_night'];
        confidence = 0.96;
      } else if (morphology.isFootwearProfile) {
        // Horizontal profile footwear
        category = 'footwear';
        subcategory = 'sneakers';
        material = 'leather';
        style = 'casual';
        confidence = 0.94;
      } else if (morphology.fgAspect >= 1.75 && morphology.hasLegSplit) {
        // Bifurcated tall profile = Jeans / Trousers
        category = 'bottoms';
        subcategory = primaryColor === 'blue' || primaryColor === 'black' ? 'jeans' : 'trousers';
        material = primaryColor === 'blue' ? 'denim' : 'cotton';
        confidence = 0.93;
      } else if (morphology.midWidth >= 44 && morphology.coverage >= 0.50) {
        // Broad shoulder coverage outerwear
        category = 'outerwear';
        subcategory = 'jacket';
        material = 'cotton';
        season = 'autumn';
        confidence = 0.91;
      } else if (aspectRatio >= 1.45) {
        category = 'bottoms';
        subcategory = 'trousers';
        confidence = 0.88;
      } else {
        // Balanced upper body clothing
        category = 'tops';
        subcategory = 't-shirt';
        confidence = 0.88;
      }
    }

    // Enforce user hint if provided explicitly
    if (userHintCategory && userHintCategory !== 'all' && userHintCategory !== 'auto') {
      const hint = userHintCategory.toLowerCase();
      if (category !== hint) {
        category = hint;
        subcategory = hint === 'accessories' ? 'watch' : hint === 'footwear' ? 'sneakers' : hint === 'bottoms' ? 'trousers' : 't-shirt';
      }
    }

    return {
      category,
      subcategory,
      primaryColor,
      secondaryColors,
      pattern,
      texture,
      material,
      style,
      formality,
      season,
      useCases,
      confidence,
    };
  }

  private async extractMorphology(imagePath: string) {
    try {
      if (!fs.existsSync(imagePath)) {
        return { fgAspect: 1.0, coverage: 0.5, isSymmetricStrap: false, hasLegSplit: false, isFootwearProfile: false, midWidth: 32 };
      }
      const { data } = await sharp(imagePath)
        .resize(64, 64, { fit: 'fill' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const W = 64, H = 64;
      let bgR = 0, bgG = 0, bgB = 0, count = 0;
      for (const y of [0, 1, 62, 63]) {
        for (const x of [0, 1, 62, 63]) {
          const idx = (y * W + x) * 3;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
          count++;
        }
      }
      bgR /= count; bgG /= count; bgB /= count;

      let minX = W, maxX = 0, minY = H, maxY = 0;
      let fgPixels = 0;
      const isFg = new Uint8Array(W * H);

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 3;
          const dr = Math.abs(data[idx] - bgR);
          const dg = Math.abs(data[idx + 1] - bgG);
          const db = Math.abs(data[idx + 2] - bgB);
          const diff = (dr + dg + db) / 3;
          if (diff > 18) {
            isFg[y * W + x] = 1;
            fgPixels++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (fgPixels < 40) {
        return { fgAspect: 1.0, coverage: 0.5, isSymmetricStrap: false, hasLegSplit: false, isFootwearProfile: false, midWidth: 32 };
      }

      const fgW = Math.max(1, maxX - minX + 1);
      const fgH = Math.max(1, maxY - minY + 1);
      const fgAspect = fgH / fgW;
      const coverage = fgPixels / (fgW * fgH);

      let topWidth = 0, midWidth = 0, botWidth = 0;
      for (let y = minY; y <= maxY; y++) {
        let rowMin = W, rowMax = 0, rowCount = 0;
        for (let x = minX; x <= maxX; x++) {
          if (isFg[y * W + x]) {
            rowCount++;
            if (x < rowMin) rowMin = x;
            if (x > rowMax) rowMax = x;
          }
        }
        const rowSpan = rowCount > 0 ? (rowMax - rowMin + 1) : 0;
        const relY = (y - minY) / fgH;
        if (relY < 0.28) topWidth = Math.max(topWidth, rowSpan);
        else if (relY < 0.72) midWidth = Math.max(midWidth, rowSpan);
        else botWidth = Math.max(botWidth, rowSpan);
      }

      // Watches have narrow straps above and below a wider central dial, with centered bounds
      const isSymmetricStrap = (topWidth <= midWidth * 0.85 && botWidth <= midWidth * 0.85 && midWidth <= 38 && midWidth >= 10);
      const isFootwearProfile = fgAspect <= 0.95;

      let hasLegSplit = false;
      if (fgAspect >= 1.6) {
        let splitCount = 0;
        for (let y = Math.floor(minY + fgH * 0.55); y < maxY - 2; y++) {
          let gap = 0, maxGap = 0, seenFg = false;
          for (let x = minX; x <= maxX; x++) {
            if (isFg[y * W + x]) {
              seenFg = true;
              if (gap > 2) maxGap = Math.max(maxGap, gap);
              gap = 0;
            } else if (seenFg) {
              gap++;
            }
          }
          if (maxGap >= 3) splitCount++;
        }
        if (splitCount >= 4) hasLegSplit = true;
      }

      return { fgAspect, coverage, topWidth, midWidth, botWidth, isSymmetricStrap, hasLegSplit, isFootwearProfile };
    } catch {
      return { fgAspect: 1.0, coverage: 0.5, isSymmetricStrap: false, hasLegSplit: false, isFootwearProfile: false, midWidth: 32 };
    }
  }

  private detectColor(r: number, g: number, b: number): string {
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (brightness > 220 && delta < 25) return 'white';
    if (brightness > 180 && r > 180 && g > 175 && b < r) return 'cream';
    if (brightness < 45) return 'black';
    if (brightness < 80 && delta < 18) return 'charcoal';
    if (delta < 20) return 'grey';

    if (b > r + 20 && b > g + 15) {
      return brightness < 90 ? 'navy' : 'blue';
    }
    if (g > r + 15 && g > b + 15) {
      return r > 60 && b < 80 ? 'olive' : 'green';
    }
    if (r > g + 30 && r > b + 30) {
      return brightness < 100 ? 'burgundy' : 'red';
    }
    if (r > 130 && g > 100 && b < 90) {
      return r > 160 && g > 130 ? 'beige' : 'brown';
    }
    if (r > 140 && b > 110 && g < 100) return 'pink';

    return 'black';
  }

  private detectSecondaryColors(primary: string, r: number, g: number, b: number): string[] {
    const list: string[] = [];
    if (primary !== 'white' && (r > 180 && g > 180 && b > 180)) list.push('white');
    if (primary !== 'black' && (r < 50 && g < 50 && b < 50)) list.push('black');
    if (primary !== 'navy' && b > 130) list.push('navy');
    return list;
  }

  async generateOutfitExplanation(items: any[], occasion: string, style: string): Promise<string> {
    const itemNames = items.map((i) => i.custom_name || i.subcategory || i.category).join(', ');
    const templates = [
      `This ${style} outfit pairs ${itemNames} for a balanced ${occasion} look. The silhouette and proportions create natural visual harmony.`,
      `A polished ${occasion} combination featuring ${itemNames}. Each piece complements the others in tone and cut, delivering an effortless ${style} aesthetic.`,
      `Curated specifically for ${occasion}, this combination of ${itemNames} delivers a sharp ${style} feel assembled strictly from your owned wardrobe.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

// ----- OpenAI Vision Provider (when API Key is configured) -----

class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private visionModel: string;
  private fallback: SmartLocalVisionProvider;

  constructor() {
    this.apiKey = config.ai.apiKey;
    this.baseUrl = config.ai.apiBaseUrl;
    this.model = config.ai.model;
    this.visionModel = config.ai.visionModel;
    this.fallback = new SmartLocalVisionProvider();
  }

  async analyzeClothing(imagePath: string, originalFilename = '', userHintCategory?: string): Promise<ClothingAnalysis> {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = imagePath.endsWith('.png') ? 'image/png' : imagePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.visionModel,
          messages: [
            {
              role: 'system',
              content: `You are an expert fashion AI. Analyze the clothing or accessory item in the image and return a JSON object with:
{
  "category": one of "tops","bottoms","outerwear","footwear","accessories","dresses","traditional",
  "subcategory": specific item like "watch","t-shirt","jeans","sneakers","blazer","belt",
  "primaryColor": main color (e.g. "black","white","navy","beige","olive","grey","silver"),
  "secondaryColors": array of secondary colors,
  "pattern": "solid","striped","plaid","checkered","abstract",
  "texture": "smooth","knit","woven","denim","leather","metal","suede",
  "material": "cotton","wool","denim","leather","metal","silk","nylon",
  "style": "casual","formal","smart_casual","streetwear","sporty","minimalist",
  "formality": "casual","smart_casual","formal",
  "season": "spring","summer","autumn","winter","all",
  "useCases": ["everyday","work"],
  "confidence": 0.95
}
Note: If the item is a watch, timepiece, bracelet or belt, categorize it under "accessories". Return ONLY raw JSON.`,
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: `Analyze this fashion item. File name hint: ${originalFilename}` },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content returned from OpenAI');

      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonStr) as ClothingAnalysis;
    } catch (err) {
      console.warn('OpenAI vision call failed, using intelligent local engine:', err);
      return this.fallback.analyzeClothing(imagePath, originalFilename, userHintCategory);
    }
  }

  async generateOutfitExplanation(items: any[], occasion: string, style: string): Promise<string> {
    try {
      const itemDescriptions = items
        .map((i) => `${i.primary_color || ''} ${i.material || ''} ${i.subcategory || i.category}`.trim())
        .join(', ');

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a fashion stylist. Write a concise 2-sentence explanation of why this outfit works. Be specific about the items.',
            },
            {
              role: 'user',
              content: `Explain why this outfit works for ${occasion} with a ${style} style. Items: ${itemDescriptions}.`,
            },
          ],
          max_tokens: 200,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
      const data = (await response.json()) as any;
      return data.choices?.[0]?.message?.content || this.fallback.generateOutfitExplanation(items, occasion, style);
    } catch {
      return this.fallback.generateOutfitExplanation(items, occasion, style);
    }
  }
}

// ----- Factory -----

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    if (config.ai.provider === 'openai' && config.ai.apiKey) {
      providerInstance = new OpenAIProvider();
    } else {
      providerInstance = new SmartLocalVisionProvider();
    }
  }
  return providerInstance;
}
