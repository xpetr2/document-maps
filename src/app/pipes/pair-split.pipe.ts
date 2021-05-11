import { Pipe, PipeTransform } from '@angular/core';
import {pairSeparator} from '../utils/various.utils';

/**
 * A pipe, that splits the string using a separator and only retrieves the first one
 */
@Pipe({
  name: 'first'
})
export class PairSplitFirstPipe implements PipeTransform {
  /**
   * The transform function of the pipe
   * @param value     The string to be split
   * @param separator The separator
   */
  transform(value: string, separator = pairSeparator): string {
    return value?.includes(separator) && value?.split(separator)[0];
  }
}

/**
 * A pipe, that splits the string using a separator and only retrieves the second one
 */
@Pipe({
  name: 'second'
})
export class PairSplitSecondPipe implements PipeTransform {
  /**
   * The transform function of the pipe
   * @param value     The string to be split
   * @param separator The separator
   */
  transform(value: string, separator = pairSeparator): string {
    return value?.includes(separator) && value?.split(separator)[1];
  }
}

/**
 * A pipe, that pairs up two values using a separator
 */
@Pipe({
  name: 'pairUp'
})
export class PairUpPipe implements PipeTransform {
  /**
   * The transform function of the pipe
   * @param str1      The first string to be paired up
   * @param str2      The second string to be paired up
   * @param separator The separator put between the two strings
   */
  transform(str1: string, str2: string, separator = pairSeparator): string {
    return `${str1}${separator}${str2}`;
  }
}

/**
 * A pipe, that splits up two values at a separator
 */
@Pipe({
  name: 'splitUp'
})
export class SplitUpPipe implements PipeTransform {
  /**
   * The transform function of the pipe
   * @param value     The string to be split up
   * @param separator The separator at which the split will happen
   */
  transform(value: string, separator = pairSeparator): string[] {
    return value?.includes(separator) && value?.split(separator);
  }
}
