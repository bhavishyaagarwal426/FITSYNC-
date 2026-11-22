import { config } from '../config/index.js';
import fs from 'fs';

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
  analyzeClothing(imagePath: string): Promise<ClothingAnalysis>;
  generateOutfitExplanation(items: any[], occasion: string, style: string): Promise<string>;
}

// ----- Demo Provider -----

const DEMO_CATEGORIES = [
  { category: 'tops', subcategories: ['t-shirt', 'dress-shirt', 'blouse', 'sweater', 'hoodie', 'polo', 'tank-top', 'henley'] },
  { category: 'bottoms', subcategories: ['jeans', 'chinos', 'trousers', 'shorts', 'skirt', 'joggers', 'cargo-pants'] },
  { category: 'outerwear', subcategories: ['jacket', 'blazer', 'coat', 'cardigan', 'vest', 'windbreaker', 'parka'] },
  { category: 'footwear', subcategories: ['sneakers', 'boots', 'loafers', 'sandals', 'dress-shoes', 'heels', 'flats'] },
  { category: 'accessories', subcategories: ['watch', 'belt', 'hat', 'scarf', 'sunglasses', 'bag', 'jewelry'] },
  { category: 'dresses', subcategories: ['casual-dress', 'cocktail-dress', 'maxi-dress', 'sundress', 'wrap-dress'] },
];

const COLORS = ['black', 'white', 'navy', 'grey', 'beige', 'brown', 'olive', 'burgundy', 'blue', 'red', 'green', 'pink', 'cream', 'charcoal', 'tan'];
const PATTERNS = ['solid', 'striped', 'plaid', 'floral', 'checkered', 'geometric', 'abstract', 'polka-dot'];
const TEXTURES = ['smooth', 'ribbed', 'knit', 'woven', 'denim', 'suede', 'leather', 'fleece', 'silk'];
const MATERIALS = ['cotton', 'polyester', 'linen', 'wool', 'denim', 'silk', 'leather', 'nylon', 'cashmere', 'jersey'];
const STYLES = ['casual', 'formal', 'smart_casual', 'streetwear', 'sporty', 'minimalist', 'bohemian', 'vintage', 'preppy'];
const FORMALITY_LEVELS = ['very_casual', 'casual', 'smart_casual', 'business_casual', 'semi_formal', 'formal'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter', 'all'];
const USE_CASES = ['work', 'casual', 'date_night', 'party', 'sports', 'travel', 'formal_event', 'beach', 'everyday', 'outdoor'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

class DemoProvider implements AIProvider {
  async analyzeClothing(_imagePath: string): Promise<ClothingAnalysis> {
    const catInfo = pickRandom(DEMO_CATEGORIES);
    const primaryColor = pickRandom(COLORS);
    const secondaryColors = pickRandomN(
      COLORS.filter((c) => c !== primaryColor),
      Math.floor(Math.random() * 2) + 1
    );

    return {
      category: catInfo.category,
      subcategory: pickRandom(catInfo.subcategories),
      primaryColor,
      secondaryColors,
      pattern: pickRandom(PATTERNS),
      texture: pickRandom(TEXTURES),
      material: pickRandom(MATERIALS),
      style: pickRandom(STYLES),
      formality: pickRandom(FORMALITY_LEVELS),
      season: pickRandom(SEASONS),
      useCases: pickRandomN(USE_CASES, Math.floor(Math.random() * 3) + 2),
      confidence: parseFloat((0.7 + Math.random() * 0.25).toFixed(2)),
    };
  }

  async generateOutfitExplanation(items: any[], occasion: string, style: string): Promise<string> {
    const itemNames = items.map((i) => i.custom_name || i.subcategory || i.category).join(', ');
    const explanations = [
      `This ${style} outfit pairs ${itemNames} for a perfect ${occasion} look. The color coordination creates visual harmony while maintaining comfort and practicality.`,
      `A well-balanced ${occasion} ensemble featuring ${itemNames}. Each piece complements the others in both style and silhouette, creating a cohesive ${style} aesthetic.`,
      `Curated for ${occasion}, this combination of ${itemNames} delivers a polished ${style} vibe. The textures and tones work together to create an effortlessly stylish appearance.`,
      `For ${occasion}, this ${style} outfit brings together ${itemNames}. The pieces are selected for their complementary colours and proportions, ensuring you look put-together yet relaxed.`,
    ];
    return pickRandom(explanations);
  }
}

// ----- OpenAI Provider -----

class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private visionModel: string;

  constructor() {
    this.apiKey = config.ai.apiKey;
    this.baseUrl = config.ai.apiBaseUrl;
    this.model = config.ai.model;
    this.visionModel = config.ai.visionModel;
  }

  async analyzeClothing(imagePath: string): Promise<ClothingAnalysis> {
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
            content: `You are a fashion analysis AI. Analyze the clothing item in the image and return a JSON object with these exact fields:
{
  "category": one of "tops","bottoms","outerwear","footwear","accessories","dresses",
  "subcategory": specific type like "t-shirt","jeans","sneakers",etc,
  "primaryColor": main color,
  "secondaryColors": array of other colors,
  "pattern": one of "solid","striped","plaid","floral","checkered","geometric","abstract","polka-dot",
  "texture": one of "smooth","ribbed","knit","woven","denim","suede","leather","fleece","silk",
  "material": best guess of material,
  "style": one of "casual","formal","smart_casual","streetwear","sporty","minimalist","bohemian","vintage","preppy",
  "formality": one of "very_casual","casual","smart_casual","business_casual","semi_formal","formal",
  "season": one of "spring","summer","autumn","winter","all",
  "useCases": array of applicable use cases,
  "confidence": your confidence 0-1
}
Return ONLY the JSON, no markdown.`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this clothing item.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as ClothingAnalysis;
  }

  async generateOutfitExplanation(items: any[], occasion: string, style: string): Promise<string> {
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
            content: 'You are a friendly fashion stylist. Write a brief, engaging 2-3 sentence explanation of why this outfit works together. Be specific about the items.',
          },
          {
            role: 'user',
            content: `Explain why this outfit works for a ${occasion} occasion with a ${style} style. Items: ${itemDescriptions}.`,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    return data.choices?.[0]?.message?.content || 'A stylish outfit combination selected for you.';
  }
}

// ----- Factory -----

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    if (config.ai.provider === 'openai' && config.ai.apiKey) {
      providerInstance = new OpenAIProvider();
    } else {
      providerInstance = new DemoProvider();
    }
  }
  return providerInstance;
}
