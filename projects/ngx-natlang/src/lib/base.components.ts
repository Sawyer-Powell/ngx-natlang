import { Type, ViewChild, OnInit, Component, ViewContainerRef } from "@angular/core";
import { ChatService, ComponentCreate } from "./services/aichat-service.service";
import { Action } from "./action";
import { ChatHandler } from "./ai-chat-handler";

@Component({
    template: ''
})
export class ChatComponent {
    constructor(private ai_chat_service: ChatService) {}

    render(component: ComponentCreate) {
        this.ai_chat_service.component_emitter.emit(component);
    }
}

// @Component({
//     template: '<div #chat_window></div>'
// })
// export class AIChatWindow implements OnInit {
//     @ViewChild('chat_window', {read: ViewContainerRef}) chat!: ViewContainerRef

//     constructor(
//         private ai_chat_service: AIChatService,
//         private processor: Processor = new Processor(
//         )
//     ) {}

//     ngOnInit(): void {
//         this.ai_chat_service.eventEmitter.subscribe((d) => {
//             console.log(d);
//         })
//     }
// }

