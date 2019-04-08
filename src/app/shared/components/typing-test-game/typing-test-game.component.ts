import { Component, OnInit, HostListener } from '@angular/core';
import { TypingTestGameService } from '../../services/typing-test-game/typing-test-game.service';

@Component({
  selector: 'app-typing-test-game',
  templateUrl: './typing-test-game.component.html',
  styleUrls: ['./typing-test-game.component.less']
})
export class TypingTestGameComponent implements OnInit {
  public active: boolean;
  public lastKey: string;
  public stories: any[];
  public activeStory: any;

  constructor(public typingTestGameService: TypingTestGameService) {
    this.active = true;
    this.lastKey = '';
    this.stories = [];
    this.activeStory = {
      name: '',
      content: ''
    };
  }

  ngOnInit() {
    this.typingTestGameService.getStories().subscribe((response: any) => {
      this.stories = response.data.stories;
      console.log(this.stories);
      this.activeStory = this.stories[0];
    });
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.lastKey = event.key;
  }
}
