import {
  ChangeDetectorRef,
  ViewContainerRef,
} from "@angular/core";

import {
  ChatService,
  ComponentCreate,
  ProcessPrompt
} from "./services/aichat-service.service";

import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage
} from 'openai/dist/api';

import { Action } from "./action";
import { HttpClient } from "@angular/common/http";

export class ChatHandler {
  private chat_history: ChatCompletionRequestMessage[] = [];
  private action_objects: Action<any>[];

  constructor(
    private ai_chat_service: ChatService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ai_chat_window: ViewContainerRef,
    private human_message_component: any,
    private ai_message_component: any,
    private get_ai_response: ((
      messages: ChatCompletionRequestMessage[],
      schemas: ChatCompletionFunctions[]
    ) => Promise<ChatCompletionResponseMessage | undefined>) | undefined,
    actions: Array<new (ai_chat_service: ChatService, http: HttpClient) => Action<any>> = [],
    private prepend?: boolean,
  ) {
    if (!get_ai_response) {
      throw Error("get_ai_response is undefined")
    }

    if(this.ai_chat_window == undefined) {
      throw Error(
        `Chat window is undefined at the moment of ChatHandler initialization.\
        Are you sure chat window's ViewContainer is rendered at this point?`
      )
    }

    ai_chat_service.emitters.component.subscribe((component) => {
      this.render_component(component);
    });

    ai_chat_service.emitters.prompt.subscribe((prompt) => {
      this.process_prompt(prompt);
    });

    ai_chat_service.emitters.context.subscribe((context) => {
      this.system_prompt(context, false);
    })

    ai_chat_service.emitters.system_prompt.subscribe((prompt) => {
      this.system_prompt(prompt, true)
    })

    ai_chat_service.emitters.general.subscribe((message) => {
      switch (message.message) {
        case 'get_history':
          ai_chat_service.emitters.history.emit(this.chat_history)
          break;
        case 'clear_history':
          this.clear_history()
          break;
      }
    })

    this.action_objects = actions.map(
      action => (new action(this.ai_chat_service, this.http))
    );
  }

  async get_ai_response_safe(schemas: ChatCompletionFunctions[]): Promise<ChatCompletionRequestMessage | undefined> {
    if (!this.get_ai_response) {
      throw Error("get_ai_response is not defined")
    }

    return await this.get_ai_response(
      this.chat_history,
      schemas
    )
  }

  async system_prompt(content: string, with_response: boolean) {
    this.save_system_message(content);

    if(with_response) {
      this.ai_chat_service.start_loading();

      let response = await this.get_ai_response_safe(
        []
      );

      this.ai_chat_service.emitters.response.emit(response);
      this.ai_chat_service.end_loading();

      if (response && response.content) {
        this.render_ai_message(response.content);
        this.save_ai_message(response.content);
      }
    }
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
    let schemas: ChatCompletionFunctions[];

    if(prompt.schemas) {
      schemas = prompt.schemas;
    } else {
      schemas = [];
      this.action_objects.forEach(action => {
        if (action.schema) {
          let schema = action.schema;
          schema.description = action.description;
          schemas.push(schema);
        }
      });
    }

    let prompt_text: string = prompt.prompt;

    this.render_human_message(prompt_text);
    this.save_human_message(prompt_text);

    this.ai_chat_service.start_loading();

    let response = await this.get_ai_response_safe(
      schemas
    );

    this.ai_chat_service.emitters.response.emit(response);
    this.ai_chat_service.end_loading();

    if(response === undefined) { return; }

    let action = this.action_objects.find(x => {
      if (x.schema === undefined) {
        return false;
      } else {
        return x.schema.name === response?.function_call?.name;
      }
    });

    if(response.content != undefined) {
      this.render_ai_message(response.content);
      this.save_ai_message(response.content);
    }

    if(action === undefined) { return; }

    if (
      response.function_call !== undefined &&
      response.function_call.arguments !== undefined
    ) {
      let data = JSON.parse(response.function_call.arguments);
      let action_result = await action.run(data);
      if(action_result) {
        this.save_system_message(action_result);
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
