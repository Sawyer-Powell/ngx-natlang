import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiChatDirective } from '../ai-chat.directive';

@NgModule({
  declarations: [
    AiChatDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AiChatDirective
  ]
})
export class AiChatModule { }
