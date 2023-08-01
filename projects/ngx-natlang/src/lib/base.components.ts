import { Component } from "@angular/core";
import { ChatService, ComponentCreate } from "./services/aichat-service.service";

@Component({
    template: ''
})
export class ChatComponent {
    constructor(private ai_chat_service: ChatService) {}

    render(component: ComponentCreate) {
        this.ai_chat_service.component_emitter.emit(component);
    }
}

