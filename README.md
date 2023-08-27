# NgxNatlang

**Build production ready embedded AI chat experiences with Angular and OpenAI**

### Installation

In your Angular 16 (or greater) project, run:

```bash
npm i ngx-natural-language
```

### Quickstart

Create a new component to manage the AI chat window 

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

Create the components that will represent the user message, and ai message
in our chat window.

```typescript
@Component({
  selector: 'app-user-message',
  template: `
  <div>
    <h2>User Message</h2>
    {{content}}
  </div>
  `
})
class UserMessageComponent {
  @Input() content: string = "Lorem Ipsum"
}

@Component({
  selector: 'app-ai-message',
  template: `
  <div>
    <h2>AI Message</h2>
    {{content}}
  </div>
  `
})
class AiMessageComponent {
  @Input() content: string = "Lorem Ipsum"
}
```

Create the function for querying OpenAI. This is not provided by default in
ngx-natlang due to security concerns of making requests directly in the
frontend of the application. Here is one implemented in the frontend using
the [openai npm package](https://www.npmjs.com/package/openai) for 
demonstration purposes.

```typescript
export async function get_ai_response(
  messages: ChatCompletionRequestMessage[],
  schemas: ChatCompletionFunctions[]
): Promise<ChatCompletionResponseMessage | undefined> {

  const configuration = new Configuration({
    apiKey: "your api key goes here :)"
  });

  const openai = new OpenAIApi(configuration);

  const response = await openai.createChatCompletion({
    model: "gpt-4-0613",

    messages: [
      {
        role: "system",
        content: "Don't make assumptions about what values to plug into functions. You must ask for clarification if a user request is ambiguous."
      },
      ...messages
    ],
    functions: schemas.length == 0 ? undefined : schemas,
  });

  return response.data.choices[0].message;
}
```

Provide an `Action` for getting weather data.
