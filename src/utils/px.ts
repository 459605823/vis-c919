const designWidth = 1920;
const designHeight = 1080;

export function px2vw(px: number) {
  return `${(px / (designWidth / 100)).toFixed(1)}vw`;
}
export function px2vh(px: number) {
  return `${(px / (designHeight / 100)).toFixed(1)}vh`;
}
export function realPx(px: number, viewport: 'vw' | 'vh' = 'vw') {
  if (viewport === 'vw') {
    return px * (window.innerWidth / designWidth);
  } else {
    return px * (window.innerHeight / designHeight);
  }
}
