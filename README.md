# NgxNatlang

**Build production ready embedded AI chat experiences with Angular and OpenAI**

![demo screenshot](https://i.imgur.com/T9QYjWg.png)

## Installation

In your Angular 16 (or greater) project, run:

```bash
npm i ngx-natural-language
```

## The Basics

OpenAI provides a fantastic tool for getting structured data out of their
GPT-3.5 and GPT-4 models called [function calling](https://openai.com/blog/function-calling-and-other-api-updates).

This gives us an amazing opportunity to integrate LLM based computing
with traditional computing, allowing us to control applications through the
interface of natural language.

`ngx-natural-language` is my attempt at making controlling a web-application
with natural language as straightforward, expressible, and maintainable as
possible. **This framework is still in beta**, but provides excellent tools
to quickly iterate and develop a superpowered AI chat in your Angular app.

## Fundamental concepts

### The aiChat directive

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

`userMesssageComponent`
- Component used to render messages from the user in the `aiChat`.

`aiMessageComponent`
- Component used to render messages from the ai in the `aiChat`

`getAiResponse`
- Method for sending requests to OpenAi (for security reasons this must be
implemented by the user to prevent an application frontend from directly
interfacing with OpenAI)

`actions`
- A list of `Actions` available to the AI.

### Actions

Actions rigidly define avenues the AI can use to interact with your application.

Actions are defined with a description, a type, and a schema.
- The description informs the AI when to run this action
- The type describes the form of the structured data ngx-natlang will pass
into that action when it is created.
- The schema is an OpenAI functions compatible JSON schema that GPT models
can use to generate the structured data required by the type

**A note on generating schema for Actions**

`ngx-natlang` can't generate these schema on the fly, but it can generate them
from Typescript types. I recommend placing all the types you use for actions
in your application into one `types.ts` file somewhere in your app. When you
want to generate schema from them, use the `schema` tool exposed by this 
package.

```bash
npx schema path/to/types.ts path/to/output/schema.ts
```

Here's an example action for fetching data from the openweathermap api.
Typically, actions will be reaching out to endpoints on your backend, parsing
that data, rendering components to the chat window, and providing context info
to the AI through `give_context`.

```typescript
export class GetCurrentWeather extends Action<get_current_weather> {
  description: string = "Use this to fetch weather information";
  schema = getCurrentWeatherSchema;

  async run(data: get_current_weather) {
    this.start_loading();
    this.http_get("https://api.openweathermap.org/data/2.5/weather?lat=37.7749&lon=122.4194&appid=1231231238").subscribe((data) => {
      this.end_loading();
      this.render({
        component: CurrentWeatherComponent,
        inputs: [{
          name: 'current_weather',
          value: data
        }]
      });
      this.give_context(`A component was just rendered to the screen with the weather data with this information ${JSON.stringify(data)}`)
    })
  }
}
```
