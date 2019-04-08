import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TypingTestGameService {
  constructor(private httpClient: HttpClient) {}

  public getStories() {
    return this.httpClient.get('/assets/typing-test-game/stories.json');
  }
}
