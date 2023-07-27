import { ViewContainerRef, AfterViewInit } from "@angular/core";
import { 
  EventEmitter 
} from "@angular/core";


import { ChatHandler } from "./ai-chat-handler";

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

export interface ChatWindow extends AfterViewInit {
  chat_window: ViewContainerRef;
  chat_handler: ChatHandler | null;
  process_prompt(prompt: string): any;
}