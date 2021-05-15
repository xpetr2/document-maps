/**
 * A simple and quick normalization function, normalizing the inputted value between -1 and 1
 * @param value       The value to be normalized
 * @param stiffness   The incline of the function
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
    // A RegEx that validates the passed in string and separates the R, G and B values
    const conversionRe = new RegExp(/^#?([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})$/);
    const matches = hexCode.match(conversionRe);
    // If the string didn't match the RegEx, deny
    if (!matches){
      return undefined;
    }
    // Convert the individual components from hexadecimal strings to integers
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
    // Add each component by adding a part of it, based on the gradient
    const r = this.r * (1 - gradient) + other.r * (gradient);
    const g = this.g * (1 - gradient) + other.g * (gradient);
    const b = this.b * (1 - gradient) + other.b * (gradient);
    return new Color(r, g, b);
  }

  /**
   * A function that converts the color from normal color space to sRGB
   */
  protected inverseSrgbCompounding(): Color {
    // Convert the individual components from range [0, 255] to [0, 1]
    let r = this.r / 255;
    let g = this.g / 255;
    let b = this.b / 255;

    // Convert the individual components from the normal color space to the sRGB color space
    // According to https://entropymine.com/imageworsener/srgbformula/
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    return new Color(r * 255, g * 255, b * 255);
  }

  /**
   * A function that converts the sRGB color value back to normal color space
   */
  protected srgbCompounding(): Color {
    // Convert the individual components from range [0, 255] to [0, 1]
    let r = this.r / 255;
    let g = this.g / 255;
    let b = this.b / 255;

    // Convert the individual components from sRGB color space to normal color space
    // According to https://entropymine.com/imageworsener/srgbformula/
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
    // First convert to sRGB
    const c1 = this.inverseSrgbCompounding();
    const c2 = other.inverseSrgbCompounding();

    // Then mix and convert back to normal color space
    return c1.mix(c2, gradient).srgbCompounding();
  }

  /**
   * Converts a color interface to a hex code string
   */
  toHex(): string{
    // Convert the components to hexadecimal strings
    const r = (this.r >> 0).toString(16);
    const g = (this.g >> 0).toString(16);
    const b = (this.b >> 0).toString(16);
    // Add leading zeros if the string for each component is just one character long
    return `#${(r.length === 2 ? r : '0' + r)}${(g.length === 2 ? g : '0' + g)}${(b.length === 2 ? b : '0' + b)}`;
  }
}

/**
 * A class of static functions that return some predefined colors
 */
export class DefaultColors {
  static readonly deviationCorrect = () => Color.fromHex('#37b03b');
  static readonly deviationClose = () => Color.fromHex('#b03737');
  static readonly deviationFar = () => Color.fromHex('#4537b0');
}
