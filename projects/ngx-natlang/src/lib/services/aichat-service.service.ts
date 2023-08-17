import { EventEmitter, Injectable } from '@angular/core';
import { ChatCompletionFunctions, ChatCompletionRequestMessage, ChatCompletionResponseMessage } from 'openai/api'
import { await_event_emitter } from '../base.classes';

export type ComponentCreate = {
  component: any,
  inputs?: {
    name: string,
    value: any,
  }[],
  index?: number
}

export type PromptLockUpdate = {
  locked: boolean
}

export type ProcessPrompt = {
  prompt: string,
  schemas?: ChatCompletionFunctions[],

}

export type General = {
  message: 'get_history' | 'clear_history'
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  component_emitter: EventEmitter<ComponentCreate> = new EventEmitter();
  prompt_emitter: EventEmitter<ProcessPrompt> = new EventEmitter();
  response_emitter: EventEmitter<ChatCompletionResponseMessage> = new EventEmitter();
  general_emitter: EventEmitter<General> = new EventEmitter();
  history_emitter: EventEmitter<ChatCompletionRequestMessage[]> = new EventEmitter();
  give_context_emitter: EventEmitter<string> = new EventEmitter();
  system_prompt_emitter: EventEmitter<string> = new EventEmitter();
  loading_start_emitter: EventEmitter<string> = new EventEmitter();
  loading_end_emitter: EventEmitter<string> = new EventEmitter();

  render(component: ComponentCreate) {
    this.component_emitter.emit(component);
  }

  give_context(context: string) {
    this.give_context_emitter.emit(context);
  }

  send_system_prompt(prompt: string) {
    this.system_prompt_emitter.emit(prompt);
  }

  start_loading(message?: string) {
    this.loading_start_emitter.emit(message);
  }

  end_loading(message?: string) {
    this.loading_end_emitter.emit(message);
  }

  on_loading_end(a: (message?: string) => void) {
    this.loading_end_emitter.subscribe(a);
  }

  on_loading_start(a: (message?: string) => void) {
    this.loading_start_emitter.subscribe(a);
  }

  async get_history() {
    let history_promise = await_event_emitter(this.history_emitter);
    this.general_emitter.emit({ message: 'get_history' });
    let history = await history_promise;
    return history
  }

  clear_history() {
    this.general_emitter.emit({ message: 'clear_history' });
  }

  send_prompt(
    prompt: string,
    schema?: ChatCompletionFunctions[]
  ): Promise<ChatCompletionResponseMessage> {
    this.prompt_emitter.emit(({
      prompt: prompt,
      schemas: schema
    }));

    return new Promise((res, rej) => {
      this.response_emitter.subscribe((response) => {
        res(response);
      })
      setTimeout(() => {
        rej("Request timed out");
      }, 40 * 1000)
    })
  }
}
