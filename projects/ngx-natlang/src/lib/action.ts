import {
  ChatService,
  ComponentCreate
} from "./services/aichat-service.service";
import { ChatCompletionFunctions } from 'openai/dist/api';

export abstract class Action<T> {
  abstract description: string;
  abstract schema: ChatCompletionFunctions | undefined;

  constructor(
    private ai_chat_service: ChatService
  ) { }

  render(component: ComponentCreate): void {
    this.ai_chat_service.component_emitter.emit(component);
  }

  run_action(action: new (ai_chat_service: ChatService) => any): any {
    let a = new action(this.ai_chat_service);
    return a.run();
  }

  start_loading(message?: string) {
    this.ai_chat_service.start_loading(message);
  }

  end_loading(message?: string) {
    this.ai_chat_service.end_loading(message);
  }

  give_context(context: string) {
    this.ai_chat_service.give_context(context);
  }

  send_system_prompt(prompt: string) {
    this.ai_chat_service.send_system_prompt(prompt);
  }

  abstract run(data: T): Promise<string | undefined>
}

