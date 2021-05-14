

/**
 * A normalization function, normalizing between -1 and 1
 * @param value       The value to be normalized
 * @param stiffness   The initial incline of the function
 */

export function normalizeDeviation(value: number, stiffness: number = 1): number{
  return ((1 + value / (1 + Math.abs(value * stiffness))) - 1)  * stiffness;
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

/**
 * A helper color class, containing color mixing functions
 */
export class Color {
  constructor(protected r: number, protected g: number, protected b: number) {}

  static fromHex(hexCode: string): Color{
    const conversionRe = new RegExp(/^#?([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})$/);
    const matches = hexCode.match(conversionRe);
    if (!matches){
      return undefined;
    }
    const r = parseInt(matches[1], 16);
    const g = parseInt(matches[2], 16);
    const b = parseInt(matches[3], 16);
    return new Color(r, g, b);
  }

  /**
   * A naive way of color mixing, not taking color compression in mind
   * @param other     The other color to be mixed with
   * @param gradient  The gradient percentage between the two colors
   */
  mix(other: Color, gradient: number): Color {
    const r = this.r * (1 - gradient) + other.r * (gradient);
    const g = this.g * (1 - gradient) + other.g * (gradient);
    const b = this.b * (1 - gradient) + other.b * (gradient);
    return new Color(r, g, b);
  }

  /**
   * A function that decompresses the color value from normal color space
   */
  protected inverseSrgbCompounding(): Color {
    let r = this.r / 255;
    let g = this.g / 255;
    let b = this.b / 255;

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    return new Color(r * 255, g * 255, b * 255);
  }

  /**
   * A function that compresses the color value back to normal color space
   */
  protected srgbCompounding(): Color {
    let r = this.r / 255;
    let g = this.g / 255;
    let b = this.b / 255;

    r = (r > 0.0031308) ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
    g = (g > 0.0031308) ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
    b = (b > 0.0031308) ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;

    return new Color(r * 255, g * 255, b * 255);
  }

  /**
   * A color mix of two colors using the sRGB method
   * @param other     The other color to be mixed
   * @param gradient  The gradient percentage between the two colors
   */
  colorSrgbGradient(other: Color, gradient: number): Color {
    const c1 = this.inverseSrgbCompounding();
    const c2 = other.inverseSrgbCompounding();

    return c1.mix(c2, gradient).srgbCompounding();
  }

  /**
   * Converts a color interface to a hex code string
   */
  toHex(): string{
    const r = (this.r >> 0).toString(16);
    const g = (this.g >> 0).toString(16);
    const b = (this.b >> 0).toString(16);
    return `#${(r.length === 2 ? r : '0' + r)}${(g.length === 2 ? g : '0' + g)}${(b.length === 2 ? b : '0' + b)}`;
  }
}

export class DefaultColors {
  static readonly deviationCorrect = () => Color.fromHex('#37b03b');
  static readonly deviationClose = () => Color.fromHex('#b03737');
  static readonly deviationFar = () => Color.fromHex('#4537b0');
}
