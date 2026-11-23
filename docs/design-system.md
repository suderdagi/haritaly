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
| `PlaceGlyph`, `PlaceRow` | A place in a list, styled to match its map marker |

## The map's visual language

| Marker | Meaning |
| --- | --- |
| Eucalyptus circle | A place you saved |
| Lavender circle | A friend's place |
| Icon inside | The category (café, park, restaurant…) |
| Number badge | How many people saved the same place |
| Rose heart badge | One of your favorites |
| Larger charcoal circle with a name label | The selected place |
| Paper circle with a count | Several places close together; tap to zoom in |

Names are not printed under every marker. That keeps the map readable, and the name appears when a place is selected. Entries for the same place from several friends are merged into one marker. The place sheet then shows what each of them saved.

## Accessibility

- Text scales with Dynamic Type. Fixed-height chrome (tab bar, chips, markers) has a limit so the layout keeps its shape.
- Controls have VoiceOver labels and states (selected, disabled, busy). The rating input is an adjustable element.
- Information never relies on color alone: markers also differ by badge, and links are underlined inside sentences.
- Touch targets are at least 44 points, using hit slop where the visible control is smaller.

## Privacy patterns

- Location is requested only when the user taps something that needs it, after a short explanation. The only button on that explanation continues to the system prompt.
- Only "while using the app" access. Haritaly never shows anyone's position to friends.
- Without location, the map can still be moved and searched, and places can be added with the picker.
- Each place can be shared with friends or kept private.
