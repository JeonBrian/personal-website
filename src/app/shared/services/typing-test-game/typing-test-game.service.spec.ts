import { TestBed } from '@angular/core/testing';

import { TypingTestGameService } from './typing-test-game.service';

describe('TypingTestGameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypingTestGameService = TestBed.get(TypingTestGameService);
    expect(service).toBeTruthy();
  });
});
