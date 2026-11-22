export const STYLE_OPTIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'business-casual', label: 'Business Casual' },
  { value: 'smart-casual', label: 'Smart Casual' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'classic', label: 'Classic' },
  { value: 'sporty', label: 'Sporty' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'preppy', label: 'Preppy' },
  { value: 'edgy', label: 'Edgy' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'artsy', label: 'Artsy' },
] as const;

export const OCCASION_OPTIONS = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'work', label: 'Work' },
  { value: 'date-night', label: 'Date Night' },
  { value: 'party', label: 'Party' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'interview', label: 'Interview' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'gym', label: 'Gym / Active' },
  { value: 'concert', label: 'Concert' },
  { value: 'dinner', label: 'Dinner Out' },
  { value: 'outdoor', label: 'Outdoor Activity' },
] as const;

export const WEATHER_OPTIONS = [
  { value: 'hot', label: 'Hot (30°C+)', icon: '☀️' },
  { value: 'warm', label: 'Warm (20–30°C)', icon: '🌤️' },
  { value: 'mild', label: 'Mild (10–20°C)', icon: '⛅' },
  { value: 'cool', label: 'Cool (0–10°C)', icon: '🌥️' },
  { value: 'cold', label: 'Cold (Below 0°C)', icon: '❄️' },
  { value: 'rainy', label: 'Rainy', icon: '🌧️' },
  { value: 'snowy', label: 'Snowy', icon: '🌨️' },
  { value: 'windy', label: 'Windy', icon: '💨' },
] as const;

export const COLOR_OPTIONS = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'navy', label: 'Navy', hex: '#1B2A4A' },
  { value: 'grey', label: 'Grey', hex: '#808080' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'beige', label: 'Beige', hex: '#F5F0E8' },
  { value: 'red', label: 'Red', hex: '#DC2626' },
  { value: 'burgundy', label: 'Burgundy', hex: '#64172D' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
  { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { value: 'green', label: 'Green', hex: '#16A34A' },
  { value: 'olive', label: 'Olive', hex: '#808000' },
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'purple', label: 'Purple', hex: '#9333EA' },
  { value: 'teal', label: 'Teal', hex: '#14B8A6' },
  { value: 'cream', label: 'Cream', hex: '#FFFDD0' },
  { value: 'coral', label: 'Coral', hex: '#FF6B6B' },
] as const;

export const CLOTHING_CATEGORIES = [
  { value: 'tops', label: 'Tops', subcategories: ['t-shirt', 'blouse', 'shirt', 'sweater', 'hoodie', 'tank-top', 'crop-top', 'cardigan', 'turtleneck', 'polo'] },
  { value: 'bottoms', label: 'Bottoms', subcategories: ['jeans', 'trousers', 'skirt', 'shorts', 'leggings', 'chinos', 'cargo-pants', 'culottes'] },
  { value: 'dresses', label: 'Dresses', subcategories: ['mini-dress', 'midi-dress', 'maxi-dress', 'cocktail-dress', 'casual-dress', 'wrap-dress', 'shirt-dress'] },
  { value: 'outerwear', label: 'Outerwear', subcategories: ['jacket', 'coat', 'blazer', 'bomber', 'denim-jacket', 'trench-coat', 'puffer', 'windbreaker', 'vest'] },
  { value: 'shoes', label: 'Shoes', subcategories: ['sneakers', 'boots', 'heels', 'flats', 'sandals', 'loafers', 'oxfords', 'mules', 'espadrilles'] },
  { value: 'accessories', label: 'Accessories', subcategories: ['bag', 'belt', 'hat', 'scarf', 'sunglasses', 'jewellery', 'watch', 'tie', 'gloves'] },
  { value: 'activewear', label: 'Activewear', subcategories: ['sports-bra', 'running-shorts', 'yoga-pants', 'training-top', 'track-jacket'] },
  { value: 'swimwear', label: 'Swimwear', subcategories: ['one-piece', 'bikini', 'swim-trunks', 'coverup'] },
] as const;

export const FORMALITY_LEVELS = [
  { value: 'very-casual', label: 'Very Casual', description: 'Loungewear, athleisure' },
  { value: 'casual', label: 'Casual', description: 'Jeans and t-shirts' },
  { value: 'smart-casual', label: 'Smart Casual', description: 'Polished but relaxed' },
  { value: 'business-casual', label: 'Business Casual', description: 'Office appropriate' },
  { value: 'business-formal', label: 'Business Formal', description: 'Suits and professional' },
  { value: 'formal', label: 'Formal', description: 'Black tie, evening wear' },
] as const;

export const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
  { value: 'all-season', label: 'All Season' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'most-worn', label: 'Most Worn' },
  { value: 'least-worn', label: 'Least Worn' },
] as const;

export const APP_NAME = 'FITSYNC';
export const APP_TAGLINE = 'Your AI-Powered Style Companion';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ITEMS_PER_PAGE = 20;
