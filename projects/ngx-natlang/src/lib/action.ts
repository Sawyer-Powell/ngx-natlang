import {
  ChatService,
  ComponentCreate
} from "./services/aichat-service.service";
import { ChatCompletionFunctions } from 'openai/dist/api';
import { HttpClient } from "@angular/common/http";

export abstract class Action<T> {
  /**
    * The description of what this action is useful for. This description is
    * provided to the AI to help it choose which action to use.
    */
  abstract description: string;
  /**
    * The JSON schema representing the format that the AI must respond in
    * in order to use this action. To generate this schema, we recommend
    * you include all the types you need for you actions in one file, and use
    *
    * `npx schema path/to/types.ts path/to/schema.ts`
    *
    * ...to generate the schema.
    *
    * `npx schema` is provided by this package
    */
  abstract schema: ChatCompletionFunctions | undefined;

  constructor(
    private ai_chat_service: ChatService,
    private http: HttpClient
  ) { }

  /**
    * Makes a POST request using Angular's HttpClient object
  */
  http_post(
    url: string,
    body: any,
  ) {
    return this.http.post(url, body)
  }

  /**
    * Makes a GET request using Angular's HttpClient object
  */
  http_get(
    url: string,
  ) {
    return this.http.get(url)
  }

  /**
    * Renders a component to the aiChat component in this module
    */
  render(component: ComponentCreate): void {
    this.ai_chat_service.render(component);
  }

  /**
    * Renders a user component to this module's aiChat component
  */
  render_user_component(content: string) {
    this.ai_chat_service.render_user_message(content);
  }

  /**
    * Renders an ai component to this module's aiChat component
  */
  render_ai_component(content: string) {
    this.ai_chat_service.render_ai_message(content);
  }

  /**
    * Executes the run() method of another action with the provided data
    */
  run_action(
    action: new (ai_chat_service: ChatService) => any,
    data: any
  ): any {
    let a = new action(this.ai_chat_service);
    return a.run(data);
  }

  /**
    * Sends a start loading signal on ChatService
    */
  start_loading(message?: string) {
    this.ai_chat_service.start_loading(message);
  }

  /**
    * Sends an end loading signal on ChatService
    */
  end_loading(message?: string) {
    this.ai_chat_service.end_loading(message);
  }

  /**
    * Adds a system message to the chat history for the aiChat component
    * in this module, but does not prompt the AI for a response. Useful to
    * provide contextual information to the AI for it to use next time it
    * generates a response
    */
  give_context(context: string) {
    this.ai_chat_service.give_context(context);
  }

  /**
    * Adds a system message to the chat history for the aiChat component
    * in this module and then prompts the AI for a reponse. Useful to request
    * behavior from the AI without needing to rely on user prompts.
    */
  send_system_prompt(prompt: string) {
    this.ai_chat_service.send_system_prompt(prompt);
  }

  /**
    * Method used to execute this Action. Strings returned by this method
    * are treated as system prompts which are added to the chat history.
    * The AI is not prompted for a response after the history has been
    * augmented.
    *
    * @param data - The structured data, as specified by the schema provided
    * in this Action, produced by the AI when selecting this Action.
    */
  abstract run(data: T): Promise<string> | Promise<void>
}

