import {
  EventEmitter
} from "@angular/core";

export class PromptLock {
  locked: boolean = false;
}

export function await_event_emitter<T>(subscribable: EventEmitter<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    subscribable.subscribe(
      result => resolve(result),
      err => reject(err)
    );
  })
}

