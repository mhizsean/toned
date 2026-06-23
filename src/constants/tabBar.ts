export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_FLOAT_GAP = 12;
export const TAB_BAR_EXTRA_SCROLL_PADDING = 8;

export function getTabBarInset(bottomSafeInset: number): number {
  const bottom = Math.max(bottomSafeInset, 12);
  return TAB_BAR_HEIGHT + bottom + TAB_BAR_FLOAT_GAP + TAB_BAR_EXTRA_SCROLL_PADDING;
}
