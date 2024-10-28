import {Pipe, PipeTransform} from '@angular/core';

/**
 * A pure pipe wrapping the callback execution to avoid rerunning it on every CD pass.
 */
@Pipe({
  name: 'unwrapRowModelCallback',
})
export class UnwrapRowModelCallbackPipe implements PipeTransform {
  transform<TReturn>(callback: ((rowModel: any) => TReturn) | undefined, rowModel: any): TReturn | undefined {
    if (!callback) {
      return undefined;
    }

    return callback(rowModel);
  }
}
