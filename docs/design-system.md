# Haritaly design system

Haritaly should feel calm and considered: the map is the centerpiece, friends are present without being noisy, and the interface follows iOS conventions so it feels familiar from the first tap.

Everything below lives in code. Tokens are in [`mobile/src/theme/tokens.ts`](../mobile/src/theme/tokens.ts) and shared components in [`mobile/src/components/ui`](../mobile/src/components/ui). Screens use these instead of their own colors and sizes, so a change in one place changes the whole app.

## Principles

1. **The map leads.** Apple's muted map style, no points of interest, and only the controls that are needed float over it.
2. **One meaning per accent.** Most of the interface is neutral. Color appears only where it says something.
3. **Native first.** Native navigation, sheets, action sheets, alerts and permission prompts. Custom components follow iOS proportions and continuous ("squircle") corners.
4. **Quiet hierarchy.** Semibold headings rather than bold, generous spacing, and hairlines instead of heavy borders.
5. **Honest UI.** No control is shown that does not work. Empty, loading and error states are designed like any other state.

## Color

| Token | Value | Used for |
| --- | --- | --- |
| `background` | `#F7F5F0` warm ivory | Screen background |
| `surface` | `#FDFCF9` paper | Cards, sheets, list groups |
| `fill` | `#EFEDE7` | Inputs, secondary buttons, chips |
| `hairline` | `#E2DFD6` | Separators and card edges |
| `text` / `primary` | `#292D2B` deep charcoal | Text, primary buttons, selected states |
| `textSecondary` | `#666B66` | Supporting text (4.99:1 on ivory) |
| `textTertiary` | `#878B85` | Placeholders, captions |
| `accent` | `#4E6A55` deep eucalyptus | Your places, links, positive states |
| `social` | `#7A7191` deep lavender | Friends and everything social |
| `favorite` | `#A86F63` deep rose | Favorites |
| `rating` | `#9C8250` deep champagne | Stars, editorial accents |
| `danger` | `#B2493B` | Destructive actions |

Each accent also has a pale `…Soft` tint for backgrounds, such as icon tiles and tags. The pastels from the brief (sage `#B1BBA8`, eucalyptus `#778779`, lavender `#B9B3C8`, rose `#D6BDB6`, champagne `#C8B795`) are kept for large soft areas. Text and icons use the deeper versions, because the pastels are too light to read on ivory. Text colors meet WCAG AA (4.5:1) on the background.

## Type

The font is the system font, which is SF Pro on iPhone. Large sizes are tracked slightly tighter and small capitals slightly looser.

| Style | Size / line | Weight | Used for |
| --- | --- | --- | --- |
| `largeTitle` | 32 / 38 | 600 | Screen titles, place names |
| `title1` | 26 / 32 | 600 | Profile names |
| `title2` | 21 / 26 | 600 | Sheet titles |
| `title3` | 18 / 23 | 600 | Section titles, empty states |
| `headline` | 16 / 21 | 600 | Row titles, buttons |
| `body` | 16 / 23 | 400 | Running text |
| `callout` | 15 / 21 | 400 | Descriptions |
| `subhead` | 14 / 19 | 400 | Metadata |
| `footnote` | 13 / 18 | 400 | Hints and notes |
| `caption` | 12 / 16 | 500 | Labels under icons |
| `overline` | 11 / 14 | 600, uppercase, +0.9 | Section labels |

All text goes through `AppText`, which takes a `variant` and a `tone`.

## Space, shape, depth, motion

- **Spacing:** a 4-point scale (4, 8, 12, 16, 20, 24, 32, 40). Screens have a 20-point side margin.
- **Radius:** 6 for tags, 10–14 for inputs and buttons, 20 for cards, 28 for sheets, capsules for chips. Nested shapes keep concentric corners. iOS gets continuous corners (`borderCurve: 'continuous'`).
- **Shadows:** two layers, a tight contact shadow plus a soft ambient one, tinted charcoal rather than black. Cards on the background are flat with a hairline. Shadows are kept for things that float: map controls, markers, sheets.
- **Translucency:** only over the map (search, filters, map buttons), where a solid surface would hide too much.
- **Motion:** pressed elements ease to 97% and dim slightly, then spring back. Selected markers grow with a spring. Durations are 140–320 ms. Haptics mark a choice (chips, stars, markers) or a result (saved, error), never plain navigation.

## Components

| Component | What it is |
| --- | --- |
| `Button` | Primary (charcoal), secondary, tinted, ghost and destructive variants in three sizes, with loading and disabled states |
| `IconButton` | Round icon button: filled, plain, primary, or glass for use on the map |
| `Chip` | Selectable capsule with an optional icon or color dot |
| `TextField` | Soft field with label, icon, error, hint and character count. Focus shows a charcoal outline |
| `Card`, `ListGroup`, `ListRow` | Paper surfaces and iOS-style grouped rows with tinted icon tiles, values, switches and chevrons |
| `Avatar`, `AvatarStack` | Initials on a pastel chosen from the person's ID, or their photo |
| `RatingStars`, `RatingInput` | Half-star display and tap-to-rate input (an adjustable element for VoiceOver) |
| `Tag`, `SectionHeader`, `EmptyState`, `Skeleton` | Small labels, section labels, designed empty states, loading placeholders |
| `ScreenHeader`, `LargeTitle` | Large title that hands over to a small centered title on scroll |
| `Segmented` | Two or three options in one control (radio group for VoiceOver), used for who can see a place |
| `PlaceGlyph`, `PlaceRow` | A place in a list, styled to match its map marker |
| `MarkerArt` | The marker drawing, shared by the map and the sign-in illustration |
| `OwnerSwitch`, `CategoryRail` | Map filters: a glass switch for All / Yours / Friends with a sliding thumb, and icon-only category buttons where the chosen one opens into a labeled pill |
| `RecommendationCard` | Who recommended a place: their avatar, "Mert's pick", the date, their stars, their note in quotes and what to order. Lavender for friends, eucalyptus for you |
| `DirectionsButton`, `FavoriteButton` | The main actions of a place: a charcoal directions pill (with the distance when there is room) and a heart that pops when filled |
| `LocationExplainer` | The short explanation shown once before the iOS location prompt |

## The map's visual language

The map itself stays quiet (Apple's muted style, no points of interest), so the markers can have character. A marker is a rounded tile with a short tail that points at the spot, not a classic pin.

| Marker | Meaning |
| --- | --- |
| Solid eucalyptus tile, white icon | A place you saved |
| Paper tile with a lavender edge and icon, the friend's avatar on its corner | A friend's place, and whose it is |
| Icon inside | The category (café, park, restaurant…) |
| Charcoal number badge | How many people saved the same place |
| Rose heart badge | One of your favorites |
| Charcoal tile, a little larger, with a name label | The selected place |
| Paper circle with a count and a green and lavender bar | Several places close together (yours and friends'); tap to zoom in |

Yours and friends' differ by fill, edge, icon color and the avatar, not by color alone. Names are not printed under every marker. That keeps the map readable, and the name appears when a place is selected. Entries for the same place from several friends are merged into one marker. The place sheet then shows what each of them saved, each with its own ••• menu to report or block.

The sheet floats: 10 points above the tab bar and in from the screen edges, with all four corners rounded, so the map frames it. Collapsed, it shows only its header ("Around you", the count and the legend); its height is measured from that header so it still fits with larger text. Selecting a place opens it halfway.

Apple's map logo and legal link are part of the license terms, so they are never covered: the map's padding and legal label insets follow the top of the sheet, and the small map on a place's page keeps them above the sheet edge. The sign-in screens show an illustration instead of a live map.

## App icon and illustration

The icon is two rings, two friends, whose shared ground holds a compass star: discovery on a map. It uses two colors only, ivory on eucalyptus, with no gradient and no location pin, so it stays legible at 29 points and on the splash screen. The sources are SVGs in `mobile/assets/source`.

The sign-in illustration is faint contour lines of two hills and a dotted route from one of your places to a friend's, with real markers on top. It fades in under the status bar and out into the page.

## Accessibility

- Text scales with Dynamic Type, including the accessibility sizes. Fixed-height chrome (tab bar, chips, filters, markers) may grow to 1.35× and buttons to 1.5×, so the layout keeps its shape.
- Layouts wrap rather than truncate: titles and place names take two lines, the sheet's legend moves under its title, and side-by-side rows (the location card's "Open in Maps") stack at the largest sizes (`useLargeText`).
- Each screen was checked at the largest standard size (1.35×) and at an accessibility size (2×).
- Controls have VoiceOver labels and states (selected, disabled, busy). The rating input is an adjustable element.
- Information never relies on color alone: markers also differ by badge, and links are underlined inside sentences.
- Touch targets are at least 44 points, using hit slop where the visible control is smaller.

## Privacy patterns

- Location is requested only when the user taps something that needs it, after a short explanation (what it is used for, only while the app is open, never shown to friends). The only button on that explanation continues to the system prompt.
- Only "while using the app" access. The exact position stays on the phone: to load friends' places, the app sends only the center of the map area in view, rounded to about a kilometre (two decimals), and the server does not store it. Saved places keep their exact coordinates, and Haritaly never shows anyone's position to friends.
- Without location, the map can still be moved and searched, and places can be added with the picker.
- Each place can be shared with friends or kept private, and the default for new places is a setting.
- **Privacy & visibility** (Profile) gathers it in plain words: location access and what it is used for, who sees new places, how many are private, blocked people, the policies and account deletion.
- Every place or note a friend saved can be reported, and its author blocked, from the map sheet (each entry's ••• menu) and the place page. People can also be blocked from their profile.
