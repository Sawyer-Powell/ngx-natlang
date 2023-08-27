# NgxNatlang

**Build production ready embedded AI chat experiences with Angular and OpenAI**

![demo screenshot](https://i.imgur.com/T9QYjWg.png)

### Installation

In your Angular 16 (or greater) project, run:

```bash
npm i ngx-natural-language
```

### The Basics

OpenAI provides a fantastic tool for getting structured data out of their
GPT-3.5 and GPT-4 models called [function calling](https://openai.com/blog/function-calling-and-other-api-updates).

This gives us an amazing opportunity to integrate LLM based computing
with traditional computing, allowing us to control applications through the
interface of natural language.

`ngx-natural-language` is my attempt at making controlling a web-application
with natural language as straightforward, expressible, and maintainable as
possible. **This framework is still in beta**, but provides excellent tools
to quickly iterate and develop a superpowered AI chat in your Angular app.

#### Fundamental concepts

**The aiChat directive**

By importing the `AiChatModule` into `app.module.ts`, the components in that
module get access to the `aiChat` directive. By applying this directive in
a template, the DOM element it is attached to becomes a window where
AI messages and user messages are rendered to. 

`chat.component.html`
```html
<div>
  <div aiChat [options]="aiOptions"></div>
  <button (click)="process_prompt(prompt_input.value)">Send</button>
</div>
```

`chat.component.ts`
```typescript
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  aiOptions: AiOptions = {
    userMessageComponent: UserMessageComponent,
    aiMessageComponent: AiMessageComponent,
    getAiResponse: get_ai_response,
    actions: [GetCurrentWeather]
  }

  constructor(
    private chat_service: ChatService,
  ) {}
  
  process_prompt(prompt: string) {
    this.chat_service.send_prompt(prompt);
  }
}
```

Notice that we pass an **`AiOptions`** object into our `aiChat` element. Let's break
down its contents.
1. `userMesssageComponent`
  - Component used to render messages from the user in the `aiChat`.
2. `aiMessageComponent`
  - Component used to render messages from the ai in the `aiChat`
3. `getAiResponse`
  - Method for sending requests to OpenAi (for security reasons this must be
  implemented by the user to prevent an application frontend from directly
  interfacing with OpenAi)
4. `actions`
  - A list of `Actions` available to the AI.

