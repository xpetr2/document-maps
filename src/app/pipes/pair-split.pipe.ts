import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'first'
})
export class PairSplitFirstPipe implements PipeTransform {
  transform(value: string): string {
    return value?.includes('\0') && value?.split('\0')[0];
  }
}

@Pipe({
  name: 'second'
})
export class PairSplitSecondPipe implements PipeTransform {
  transform(value: string): string {
    return value?.includes('\0') && value?.split('\0')[1];
  }
}
