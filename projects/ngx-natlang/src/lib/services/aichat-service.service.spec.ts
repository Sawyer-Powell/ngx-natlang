import { TestBed } from '@angular/core/testing';

import { ChatService } from './aichat-service.service';

describe('AIChatServiceService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
