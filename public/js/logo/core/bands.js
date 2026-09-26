/* The stepped band rule, with no dependency on the tool's state, so the
   docs site renders its examples from the same code the Logo Foundry uses. */
import { hslToHex, hexToHsl } from "../../shared/color.js";

/* The stepped material is a brand rule, not a free-form ramp: five bands,
   always vertical, light at the top, in exactly 4·3·4·3·5 proportion as
   measured off the reference wordmark. colors are editable; the
   proportions and direction are not. */
export const BAND_RATIO = Object.freeze([4, 3, 4, 3, 5]);
export const BAND_TOTAL = BAND_RATIO.reduce((a, b) => a + b, 0);

export function bandOffsets() {
  const o = [];
  let acc = 0;
  for (let i = 0; i < BAND_RATIO.length; i++) {
    o.push(acc / BAND_TOTAL);
    acc += BAND_RATIO[i];
  }
  o.push(1);
  return o;
}

/* Light-to-dark ladder around a theme accent. The proportions come from the
   reference wordmark, whose middle band is the Hackerman theme accent. */
export function ladder(accent) {
  const { h, s, l } = hexToHsl(accent),
    hi = 95,
    lo = 8;
  return [
    hslToHex(h, s, l + (hi - l) * 0.78),
    hslToHex(h, s, l + (hi - l) * 0.3),
    hslToHex(h, s, l),
    hslToHex(h + 2, s * 0.35, l - (l - lo) * 0.4),
    hslToHex(h + 7, s * 0.33, l - (l - lo) * 0.76),
  ];
}
