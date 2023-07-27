import {
  ChangeDetectorRef,
  ViewContainerRef
} from "@angular/core";
import {
  ChatService,
  ComponentCreate,
  ProcessPrompt
} from "./services/aichat-service.service";
import { ChatCompletionFunctions, ChatCompletionRequestMessage, ChatCompletionResponseMessage } from 'openai/dist/api';
import { PromptLock } from "./base.classes";
import { Action } from "./action";


export class ChatHandler {
  private chat_history: ChatCompletionRequestMessage[] = [];
  private action_objects: Action<any>[];

  constructor(
    private ai_chat_service: ChatService,
    private cdr: ChangeDetectorRef,
    private prompt_lock: PromptLock,
    private ai_chat_window: ViewContainerRef,
    private human_message_component: any,
    private ai_message_component: any,
    private get_ai_response: (
      messages: ChatCompletionRequestMessage[],
      schemas: ChatCompletionFunctions[]
    ) => Promise<ChatCompletionResponseMessage | undefined>,
    actions: Array<new (ai_chat_service: ChatService) => Action<any>> = [],
    private prepend?: boolean
  ) {
    ai_chat_service.component_emitter.subscribe((component) => {
      this.render_component(component);
    });

    ai_chat_service.prompt_lock_emitter.subscribe((lock) => {
      this.prompt_lock.locked = lock.locked;
    });

    ai_chat_service.prompt_emitter.subscribe((prompt) => {
      console.log("received prompt");
      this.process_prompt(prompt);
    });

    ai_chat_service.general_emitter.subscribe((message) => {
      switch (message.message) {
        case 'get_history':
          ai_chat_service.history_emitter.emit(this.chat_history)
          break;
        case 'clear_history':
          this.clear_history()
          break;
      }
    })

    this.action_objects = actions.map(
      action => (new action(this.ai_chat_service))
    );
  }

  save_ai_message(content: string) {
    this.chat_history.push({
      role: 'assistant',
      content: content
    });
  }

  clear_history() {
    this.chat_history = [];
  }

  get_history() {
    return this.chat_history;
  }

  save_human_message(content: string) {
    this.chat_history.push({
      role: 'user',
      content: content
    });
  }

  save_system_message(content: string) {
    this.chat_history.push({
      role: 'system',
      content: content
    });
  }

  render_human_message(content: string) {
    this.render_component({
      component: this.human_message_component,
      inputs: [{
        name: 'content',
        value: content
      }],
      index: this.prepend ? 0 : undefined 
    });
  }

  render_ai_message(content: string) {
    this.render_component({
      component: this.ai_message_component,
      inputs: [{
        name: 'content',
        value: content
      }],
      index: this.prepend ? 0 : undefined
    });
  }

  async process_prompt(prompt: ProcessPrompt) {
    let schemas: ChatCompletionFunctions[] = [];

    // Get the schemas from the actions associated with this handler
    this.action_objects.forEach(action => {
      if (action.schema) {
        schemas.push(action.schema);
      }
    });

    let prompt_text: string = prompt.prompt;

    this.render_component({
      component: this.human_message_component,
      inputs: [{
        name: 'content',
        value: prompt_text
      }]
    });

    this.save_human_message(prompt_text);

    let response = await this.get_ai_response(
      this.chat_history,
      schemas
    );

    let action = this.action_objects.find(x => {
      if (x.schema === undefined) {
        return false;
      } else {
        return x.schema.name === response?.function_call?.name;
      }
    });

    if (action === undefined &&
      response !== undefined &&
      response.content !== undefined) {
      this.render_component({
        component: this.ai_message_component,
        inputs: [{
          name: 'content',
          value: response.content
        }]
      });
      this.save_ai_message(response.content);
    } else if (action !== undefined &&
      response !== undefined &&
      response.function_call !== undefined &&
      response.function_call.arguments !== undefined) {
      let data = JSON.parse(response.function_call.arguments);
      this.save_system_message(await action.run(data));
      response = await this.get_ai_response(
        this.chat_history,
        schemas
      );
      if (response && response.content) {
        this.render_ai_message(response.content);
        this.save_ai_message(response.content);
      }
    }
  }

  render_component(component: ComponentCreate, index?: number) {
    const created_component = this.ai_chat_window.createComponent(
      component.component,
      {
        index: index ? index : (this.prepend ? 0 : undefined)
      }
    );

    if (component.inputs) {
      component.inputs.forEach(input => {
        created_component.setInput(input.name, input.value);
      });
    }

    this.cdr.detectChanges();
  }
}
