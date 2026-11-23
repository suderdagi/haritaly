import { Ionicons } from '@expo/vector-icons';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Must match PLACE_CATEGORIES in the backend validators. */
export const CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Bar',
  'Park',
  'Museum',
  'Shop',
  'Hotel',
  'Attraction',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

const ICONS: Record<Category, IconName> = {
  Restaurant: 'restaurant',
  Cafe: 'cafe',
  Bar: 'wine',
  Park: 'leaf',
  Museum: 'library',
  Shop: 'bag-handle',
  Hotel: 'bed',
  Attraction: 'camera',
  Other: 'location',
};

export function categoryIcon(category?: string | null): IconName {
  return ICONS[category as Category] ?? 'location';
}

/** Outline variant for lighter UI such as chips. */
export function categoryIconOutline(category?: string | null): IconName {
  return `${categoryIcon(category)}-outline` as IconName;
}

/** How a category is written in the interface; the stored value stays "Cafe". */
export function categoryLabel(category?: string | null): string {
  if (!category) return 'Place';
  return category === 'Cafe' ? 'Café' : category;
}

const PLURALS: Record<Category, string> = {
  Restaurant: 'restaurants',
  Cafe: 'cafés',
  Bar: 'bars',
  Park: 'parks',
  Museum: 'museums',
  Shop: 'shops',
  Hotel: 'hotels',
  Attraction: 'sights',
  Other: 'places',
};

/** "cafés", "parks" */
export function categoryPlural(category: Category): string {
  return PLURALS[category];
}
