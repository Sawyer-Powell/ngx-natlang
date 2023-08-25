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
  /**
    * Emitters used for communicating with the aiChat directive
    *
    * It's recommended to use the functions provided with aiChat to use
    * and subscribe to these emitters for clarity and type safety.
    */
  emitters = {
    component: new EventEmitter(), // Hello hello
    prompt: new EventEmitter(),
    response: new EventEmitter(),
    general: new EventEmitter(),
    history: new EventEmitter(),
    context: new EventEmitter(),
    system_prompt: new EventEmitter(),
    loading_start: new EventEmitter(),
    loading_end: new EventEmitter(),
    render_user_message: new EventEmitter(),
    render_ai_message: new EventEmitter()
  }

  /**
  * Renders a component, defined as a ComponentCreate object, to the chat window
  *
  * @param component - Object defining the component you want to render to the
  * chat window, and the values you want to pass into its inputs
  */
  render(component: ComponentCreate) {
    this.emitters.component.emit(component);
  }

  /**
    * Renders a user message component to this module's aiChat component
  */
  render_user_message(content: string) {
    this.emitters.render_user_message.emit(content);
  }

  /**
    * Renders an ai message component to this module's aiChat component
  */
  render_ai_message(content: string) {
    this.emitters.render_ai_message.emit(content);
  }

  /**
    * Adds a system message to the conversation history, but does not
    * prompt the AI for a response. Useful for giving the AI information it
    * can use when it next forms a response
    *
    * @param context - The system prompt added to the conversation history
  **/
  give_context(context: string) {
    this.emitters.context.emit(context);
  }

  /**
    * Adds a system message to the conversation history and prompts
    * the AI for a response. Useful for prompting behavior in the AI
    * without relying on user prompts.
    *
    * @param prompt - The system prompt send to the AI
  **/
  send_system_prompt(prompt: string) {
    this.emitters.system_prompt.emit(prompt);
  }

  /**
    * Emits a message on ChatService.emitters.loading_start
    * You can easily subscribe to loading_start events using
    * the ChatService.on_loading_start() method
    *
    * @param message - The information to be emitted in loading_start
    */
  start_loading(message?: string) {
    this.emitters.loading_start.emit(message);
  }

  /**
    * Emits a message on ChatService.emitters.loading_end
    * You can easily subscribe to end_loading events using
    * the Chatservice.on_loading_end() method
    *
    * @param message - The information to be emitted in loading_end
    */
  end_loading(message?: string) {
    this.emitters.loading_end.emit(message);
  }

  /**
    * Subscribes to ChatService.emitters.loading_end with the provided
    * function. The aiChat directive will emit a loading_end signal every
    * time it finishes receiving a response from the AI
    */
  on_loading_end(func: (message?: string) => void) {
    this.emitters.loading_end.subscribe(func);
  }

  /**
    * Subscribes to ChatService.emitters.loading_start with the provided
    * function. The aiChat directive will emit a loading_start signal every
    * time it sends a request for response to the AI.
    */
  on_loading_start(func: (message?: string) => void) {
    this.emitters.loading_start.subscribe(func);
  }

  /**
    * Subscribes to ChatService.emitters.response with the provided function.
    * The aiChat directive will emit a response signal every time it receives
    * a response from the AI
    *
    */
  on_ai_response(func: (response?: string) => void) {
    this.emitters.response.subscribe(func);
  }

  /**
    * Fetches the entire chat history from this module's aiChat component
    */
  async get_history(): Promise<ChatCompletionRequestMessage[]> {
    let history_promise = await_event_emitter(this.emitters.history);
    this.emitters.general.emit({ message: 'get_history' });
    let history = await history_promise;
    return history
  }

  /**
    * Clears the chat history from this module's aiChat component
    */
  clear_history() {
    this.emitters.general.emit({ message: 'clear_history' });
  }

  /**
    * Adds a user message to the chat history and prompts the AI for a
    * response.
    *
    * @param schema - Optionally pass in ChatCompletionFunction schema
    * to force the AI to generate structured output
    */
  async send_prompt(
    prompt: string,
    schema?: ChatCompletionFunctions[]
  ): Promise<ChatCompletionResponseMessage> {
    this.emitters.prompt.emit(({
      prompt: prompt,
      schemas: schema
    }));

    return new Promise((res, rej) => {
      this.emitters.response.subscribe((response) => {
        res(response);
      })
      setTimeout(() => {
        rej("Request timed out");
      }, 40 * 1000)
    })
  }
}
