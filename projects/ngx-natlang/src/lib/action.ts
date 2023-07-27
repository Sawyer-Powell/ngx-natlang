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

  unlock_prompt(): void {
    this.ai_chat_service.unlock_prompt();
  }

  lock_prompt(): void {
    this.ai_chat_service.lock_prompt();
  }

  abstract run(data: T): Promise<string>
}

