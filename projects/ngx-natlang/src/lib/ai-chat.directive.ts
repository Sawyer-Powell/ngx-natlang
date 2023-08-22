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
  options: AiOptions = {}

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
      this.options.userMessageComponent,
      this.options.aiMessageComponent,
      this.options.getAiResponse,
      this.options.actions,
      this.options.prepend
    )
  }
}

/**
  * Options used to configure a component using the aiChat directive.
  *
  * @param userMessageComponent - Angular component used to render a message
  * from the user in the chat window
  *
  * @param aiMessageComponent - Angular component used to render a message
  * from the ai into the chat window
  *
  * @param getAiResponse - Method used to send data to and from OpenAI.
  * We ask that you implement this yourself since these requests require an
  * api key, and making these requests within an Angular frontend is a
  * security risk.
  *
  * @param actions - A list of Action classes defining the available
  * behavior to the AI
  *
  * @param prepend
  * If true: components are rendered from bottom to top
  * If false: components are rendered from top to bottom
  */
export type AiOptions = {
  userMessageComponent?: any,
  aiMessageComponent?: any,
  getAiResponse?: (
    messages: ChatCompletionRequestMessage[],
    schemas: ChatCompletionFunctions[]
  ) => Promise<ChatCompletionResponseMessage | undefined>,
  actions?: Array<new (ai_chat_service: ChatService) => Action<any>>,
  prepend?: boolean
}

function validateAIOptions(options: AiOptions) {
  let errors: String[] = [];

  if(!options.userMessageComponent) {
    errors.push("AIOptions missing humanMessageComponent");
  } if (!options.aiMessageComponent) {
    errors.push("AIOptions missing aiMessageComponent");
  } if (!options.getAiResponse) {
    errors.push("AIOptions missing get_ai_response");
  } if (!options.actions) {
    errors.push("AIOptions missing actions");
  }

  if (errors.length > 0) {
    throw new Error("Error in intializing AIOptions object:\n" + errors.join("\n"))
  }
}
