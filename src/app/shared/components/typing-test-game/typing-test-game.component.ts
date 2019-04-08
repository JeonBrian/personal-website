import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-typing-test-game',
  templateUrl: './typing-test-game.component.html',
  styleUrls: ['./typing-test-game.component.less']
})
export class TypingTestGameComponent implements OnInit {
  public active: boolean;
  public lastKey: string;

  constructor() {
    this.active = true;
    this.lastKey = '';
  }

  ngOnInit() {}

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.lastKey = event.key;
  }
}
