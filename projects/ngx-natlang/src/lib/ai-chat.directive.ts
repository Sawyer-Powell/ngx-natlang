import { AfterViewInit, ChangeDetectorRef, Directive, Input } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { ChatCompletionFunctions, ChatCompletionRequestMessage, ChatCompletionResponseMessage } from 'openai/api';
import { Action } from './action';
import { ChatHandler } from './ai-chat-handler';
import { ChatService } from './services/aichat-service.service';

@Directive({
  selector: '[aiChat]'
})
export class AiChatDirective implements AfterViewInit {
  @Input()
  options: AIOptions = {}

  constructor(
    private viewContainer: ViewContainerRef,
    private aiChatService: ChatService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    validateAIOptions(this.options);
    new ChatHandler(
      this.aiChatService,
      this.changeDetector,
      this.viewContainer,
      this.options.humanMessageComponent,
      this.options.aiMessageComponent,
      this.options.get_ai_response,
      this.options.actions,
      this.options.prepend
    )
  }
}

export type AIOptions = {
  humanMessageComponent?: any,
  aiMessageComponent?: any,
  get_ai_response?: (
    messages: ChatCompletionRequestMessage[],
    schemas: ChatCompletionFunctions[]
  ) => Promise<ChatCompletionResponseMessage | undefined>,
  actions?: Array<new (ai_chat_service: ChatService) => Action<any>>,
  prepend?: boolean
}

function validateAIOptions(options: AIOptions) {
  let errors: String[] = [];

  if(!options.humanMessageComponent) {
    errors.push("AIOptions missing humanMessageComponent");
  } if (!options.aiMessageComponent) {
    errors.push("AIOptions missing aiMessageComponent");
  } if (!options.get_ai_response) {
    errors.push("AIOptions missing get_ai_response");
  } if (!options.actions) {
    errors.push("AIOptions missing actions");
  }

  if (errors.length > 0) {
    throw new Error("Error in intializing AIOptions object:\n" + errors.join("\n"))
  }
}
