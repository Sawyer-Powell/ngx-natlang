import { EventEmitter, Injectable } from '@angular/core';
import { ChatCompletionFunctions, ChatCompletionRequestMessage } from 'openai/api'
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
  schema?: ChatCompletionFunctions[]
}

export type General = {
  message: 'get_history' | 'clear_history'
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  component_emitter: EventEmitter<ComponentCreate> = new EventEmitter();
  prompt_lock_emitter: EventEmitter<PromptLockUpdate> = new EventEmitter();
  prompt_emitter: EventEmitter<ProcessPrompt> = new EventEmitter();
  ai_response_emitter: EventEmitter<string> = new EventEmitter();
  general_emitter: EventEmitter<General> = new EventEmitter();
  history_emitter: EventEmitter<ChatCompletionRequestMessage[]> = new EventEmitter();

  render(component: ComponentCreate) {
    this.component_emitter.emit(component);
  }

  lock_prompt() {
    this.prompt_lock_emitter.emit({locked:true})
  }

  async get_history() {
    let history_promise = await_event_emitter(this.history_emitter); 
    this.general_emitter.emit({message: 'get_history'});
    let history = await history_promise;
    return history
  }
   
  clear_history() {
    this.general_emitter.emit({message: 'clear_history'});
  }

  unlock_prompt() {
    this.prompt_lock_emitter.emit({locked:false})
  }

  send_prompt(prompt: string, schema: ChatCompletionFunctions[]) {
    this.prompt_emitter.emit(({
      prompt: prompt,
      schema: schema
    }));
  }
}
