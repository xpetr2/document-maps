/**
 * An interface, containing the individual components of an RGB color
 */
export interface Color{
  r: number;
  g: number;
  b: number;
}

/**
 * A normalization function, normalizing between -1 and 1
 * @param value       The value to be normalized
 * @param stiffness   The initial incline of the function
 */
export function normalizeDeviation(value: number, stiffness: number = 1): number{
  return ((1 + value / (1 + Math.abs(value * stiffness))) - 1)  * stiffness;
}

/**
 * A naive way of color mixing, not taking color compression in mind
 * @param color1    First color to be mixed
 * @param color2    Second color to be mixed
 * @param gradient  The gradient percentage between the two colors
 */
export function colorMix(color1: Color, color2: Color, gradient: number): Color {
  const r = color1.r * (1 - gradient) + color2.r * (gradient);
  const g = color1.g * (1 - gradient) + color2.g * (gradient);
  const b = color1.b * (1 - gradient) + color2.b * (gradient);
  return {r, g, b};
}

/**
 * A function that decompresses the color value from normal color space
 * @param color The color to be decompressed
 */
export function inverseSrgbCompanding(color: Color): Color {
  let r = color.r / 255;
  let g = color.g / 255;
  let b = color.b / 255;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  return {r: r * 255, g: g * 255, b: b * 255};
}

/**
 * A function that compresses the color value back to normal color space
 * @param color The color to be compressed
 */
export function srgbCompanding(color: Color): Color {
  let r = color.r / 255;
  let g = color.g / 255;
  let b = color.b / 255;

  r = (r > 0.0031308) ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
  g = (g > 0.0031308) ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
  b = (b > 0.0031308) ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;

  return {r: r * 255, g: g * 255, b: b * 255};
}

/**
 * A color mix of two colors using the sRGB method
 * @param color1    First color to be mixed
 * @param color2    Second color to be mixed
 * @param gradient  The gradient percentage between the two colors
 */
export function colorSrgbGradient(color1: Color, color2: Color, gradient: number): Color {
  const c1 = inverseSrgbCompanding(color1);
  const c2 = inverseSrgbCompanding(color2);

  return srgbCompanding(colorMix(c1, c2, gradient));
}

/**
 * Converts a color interface to a hexcode string
 * @param color The color to be converted
 */
export function colorToHex(color: Color): string{
  const r = (color.r >> 0).toString(16);
  const g = (color.g >> 0).toString(16);
  const b = (color.b >> 0).toString(16);
  return `#${(r.length === 2 ? r : '0' + r)}${(g.length === 2 ? g : '0' + g)}${(b.length === 2 ? b : '0' + b)}`;
}

/**
 * Returns the base 2 logarithm of a number
 * @param n The number to return the logarithm of
 */
export function log2(n: number): number{
  return Math.log2(n);
}

/**
 * Returns the 2 to the power of the specified number
 * @param n The number to return the 2 to the power of
 */
export function pow2(n: number): number{
  return Math.pow(2, n);
}
