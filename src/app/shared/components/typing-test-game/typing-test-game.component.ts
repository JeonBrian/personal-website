import { Component, OnInit, HostListener } from '@angular/core';
import { TypingTestGameService } from '../../services/typing-test-game/typing-test-game.service';
import {
  StoryInterface,
  ActiveStoryInterface,
  CharacterInterface
} from '../../services/typing-test-game/typing-test-game.model';

@Component({
  selector: 'app-typing-test-game',
  templateUrl: './typing-test-game.component.html',
  styleUrls: ['./typing-test-game.component.less']
})
export class TypingTestGameComponent implements OnInit {
  public active: boolean;
  public lastKey: string;
  public stories: StoryInterface[];
  public activeStory: ActiveStoryInterface;
  public stats: any;
  public gameStarted: boolean;

  public timeLeft: number;
  public timeLimit: number;
  public timeProgress: number;
  private timer: NodeJS.Timer;

  constructor(public typingTestGameService: TypingTestGameService) {
    this.active = true;
    this.lastKey = '';
    this.stories = [];
    this.activeStory = {
      characters: [],
      name: '',
      content: '',
      cursorIndex: 0
    };
    this.stats = {
      incorrect: 0,
      correct: 0,
      timeElapsed: 0,
      wpm: 0,
      accuracy: 0
    };
    this.timeLimit = 10;
    this.timeLeft = this.timeLimit;
    this.timeProgress = 100;
    this.gameStarted = false;
  }

  ngOnInit() {
    this.typingTestGameService.getStories().subscribe((response: any) => {
      this.stories = response.data.stories;
      this.activeStory = this.processStory(this.stories[0]);
    });
  }

  // Process story object and parse its content into an array of Characters
  public processStory(story: StoryInterface): ActiveStoryInterface {
    console.log(story);
    const output: ActiveStoryInterface = {
      name: story.name,
      content: story.content,
      characters: [],
      cursorIndex: 0
    };
    const storyArray = story.content.split('');
    storyArray.forEach(character => {
      // Process content
      let display = character;
      if (character === '^') {
        display = '↵<br><br>';
      }
      const charState = 'pristine';

      // Generate Character object and push
      const newChar: CharacterInterface = {
        content: character,
        state: charState,
        entered: '',
        display
      };
      output.characters.push(newChar);
    });
    return output;
  }

  // Stats functions
  private calculateStats() {
    if (this.stats.timeElapsed > 0) {
      const words = (this.stats.correct - this.stats.incorrect * 5) / 5;
      const timeProportion = this.stats.timeElapsed / 60;
      this.stats.wpm = Math.round(words / timeProportion);
      if (this.stats.wpm < 0) {
        this.stats.wpm = 0;
      }
      this.stats.accuracy = Math.round(
        (this.stats.correct / (this.stats.correct + this.stats.incorrect)) * 100
      );
    }
  }

  // Timer functions
  public startTimer() {
    this.timeProgress = 100;
    this.timeLeft = this.timeLimit;
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.stats.timeElapsed++;
        // this.timeProgress = Math.round((this.timeLeft / this.timeLimit) * 100);
        // console.log(this.timeProgress);
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  public resetTimer() {
    clearInterval(this.timer);
    this.timeLeft = this.timeLimit;
  }

  // Keypress functions
  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (event.key === 'Backspace') {
      this.keyRemoved();
    }
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    event.preventDefault();
    this.keyEntered(event.key);
  }

  public keyEntered(key: string) {
    if (this.gameStarted === false) {
      this.gameStarted = true;
      this.startTimer();
    }

    this.lastKey = key;
    const currentCharacter = this.getActiveCharacter(0);
    // Determine if key was correct
    if (this.lastKey === 'Enter' && currentCharacter.content === '^') {
      currentCharacter.state = 'correct';
      this.stats.correct++;
    } else if (this.lastKey !== currentCharacter.content) {
      currentCharacter.state = 'incorrect';
      this.stats.incorrect++;
    } else {
      currentCharacter.state = 'correct';
      this.stats.correct++;
    }
    // Process what is entered as input
    if (this.lastKey === ' ') {
      currentCharacter.entered = '&nbsp';
    } else if (this.lastKey === 'Enter') {
      currentCharacter.entered = '^';
    } else {
      currentCharacter.entered = this.lastKey;
    }

    // Special rendering for if the content was a newline.
    if (currentCharacter.entered === '^' || currentCharacter.content === '^') {
      if (currentCharacter.state === 'correct') {
        currentCharacter.display = '↵<br><br>';
      } else {
        currentCharacter.display = '↵';
      }
    } else {
      currentCharacter.display = currentCharacter.entered;
    }

    // Calculate stats
    this.calculateStats();

    // Increment cursor
    this.activeStory.cursorIndex++;
  }

  public keyRemoved() {
    const currentCharacter = this.getActiveCharacter(0);
    const previousCharacter = this.getActiveCharacter(-1);
    currentCharacter.state = 'pristine';
    previousCharacter.entered = '';
    previousCharacter.display =
      previousCharacter.content === '^'
        ? '↵<br><br>'
        : previousCharacter.content;
    if (previousCharacter.state === 'correct') {
      this.stats.correct--;
    } else if (previousCharacter.state === 'incorrect') {
      this.stats.incorrect--;
    }

    this.activeStory.cursorIndex--;
  }

  // If no index is provided, return current character at activeIndex
  private getActiveCharacter(index) {
    index = this.activeStory.cursorIndex + index;
    return this.activeStory.characters[index];
  }
}
