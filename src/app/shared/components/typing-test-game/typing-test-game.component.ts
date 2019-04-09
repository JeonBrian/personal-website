import { Component, OnInit, HostListener } from '@angular/core';
import { TypingTestGameService } from '../../services/typing-test-game/typing-test-game.service';
import {
  StoryInterface,
  ActiveStoryInterface,
  CharacterInterface,
  WordInterface,
  ParagraphInterface
} from '../../services/typing-test-game/typing-test-game.model';
import { CHAR_CONSTANTS } from '../../services/typing-test-game/typing-test-game.constants';

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
  public gameLoaded: boolean;
  public gameFinished: boolean;

  public timeLeft: number;
  public timeLimit: number;
  public timeProgress: number;
  // TODO: Replace with NodeJS.Timer
  private timer: any;

  constructor(public typingTestGameService: TypingTestGameService) {
    this.active = true;
    this.lastKey = '';
    this.stories = [];
    this.activeStory = {
      paragraphs: [],
      name: '',
      content: '',
      paragraphCursor: 0,
      wordCursor: 0,
      characterCursor: 0
    };
    this.stats = {
      incorrect: 0,
      correct: 0,
      timeElapsed: 0,
      wpm: 0,
      accuracy: 0
    };
    this.timeLimit = 60;
    this.timeLeft = this.timeLimit;
    this.timeProgress = 100;
    this.gameStarted = false;
    this.gameLoaded = false;
    this.gameFinished = false;
  }

  ngOnInit() {
    this.typingTestGameService.getStories().subscribe((response: any) => {
      this.stories = response.data.stories;
      this.activeStory = this.processStory(this.stories[0]);
      setTimeout(() => {
        this.gameLoaded = true;
      }, 500);
    });
  }

  // Process story object and parse its content into an array of Characters
  public processStory(story: StoryInterface): ActiveStoryInterface {
    const output: ActiveStoryInterface = {
      name: story.name,
      content: story.content,
      paragraphs: [],
      paragraphCursor: 0,
      wordCursor: 0,
      characterCursor: 0
    };
    // Split story up into individual letters, then process them into words
    const storyArray = story.content.split('');
    let newParagraph: ParagraphInterface = {
      isClosed: false,
      words: []
    };
    let newWord: WordInterface = {
      characters: []
    };
    storyArray.forEach(character => {
      // Process character content and state

      let display = character;
      if (character === CHAR_CONSTANTS.NEWLINE.alias) {
        display = CHAR_CONSTANTS.NEWLINE.display;
      } else if (character === CHAR_CONSTANTS.SPACE.alias) {
        character = CHAR_CONSTANTS.SPACE.actual;
        display = CHAR_CONSTANTS.SPACE.display;
      }
      const charState = 'pristine';

      // Generate Character object and push
      const newChar: CharacterInterface = {
        content: character,
        state: charState,
        entered: '',
        display
      };

      // Add to word or words
      // console.log(newChar.content + ' === ' + CHAR_CONSTANTS.NEWLINE.actual);
      if (newChar.content === CHAR_CONSTANTS.NEWLINE.actual) {
        newWord.characters.push(newChar);
        newParagraph.words.push(newWord);
        output.paragraphs.push(newParagraph);
        newParagraph = { isClosed: false, words: [] };
        newWord = { characters: [] };
      } else if (newChar.content === CHAR_CONSTANTS.SPACE.actual) {
        newWord.characters.push(newChar);
        newParagraph.words.push(newWord);
        newWord = { characters: [] };
      } else {
        newWord.characters.push(newChar);
      }
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

        if (this.stats.timeElapsed % 1 === 0) {
          // Calculate stats
          this.calculateStats();
        }
      } else {
        // Game over!
        this.gameFinished = true;
        this.gameStarted = false;
        this.gameLoaded = false;
        this.calculateStats();
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
    // If it hasn't been already started, start the game and timer
    if (this.gameStarted === false) {
      this.gameStarted = true;
      this.startTimer();
    }

    // Process input key to standard
    this.lastKey = key;
    switch (this.lastKey) {
      case 'Enter':
        this.lastKey = CHAR_CONSTANTS.NEWLINE.actual;
        break;
      case ' ':
        this.lastKey = CHAR_CONSTANTS.SPACE.actual;
        break;
      default:
        break;
    }

    const currentCharacter = this.getActiveCharacter(0);
    // Determine if key was correct
    if (keyIsCorrect(this.lastKey)) {
      currentCharacter.state = 'correct';
      this.stats.correct++;
    } else {
      currentCharacter.state = 'incorrect';
      this.stats.incorrect++;
    }
    // Process what is entered as input
    currentCharacter.entered = this.lastKey;

    // Special rendering for if the content was a newline.
    if (
      currentCharacter.entered === CHAR_CONSTANTS.NEWLINE.actual ||
      currentCharacter.content === CHAR_CONSTANTS.NEWLINE.actual
    ) {
      if (currentCharacter.state === 'correct') {
        currentCharacter.display = CHAR_CONSTANTS.NEWLINE.display;
      } else {
        currentCharacter.display = CHAR_CONSTANTS.SPACE.display;
      }
    } else {
      currentCharacter.display = currentCharacter.entered;
    }

    // Increment cursor
    this.incrementCursor();

    function keyIsCorrect(keyToCheck: string) {
      const isIdentical = keyToCheck === currentCharacter.content;
      return isIdentical;
    }
  }

  public keyRemoved() {
    if (
      this.activeStory.characterCursor !== 0 ||
      this.activeStory.wordCursor !== 0 ||
      this.activeStory.paragraphCursor !== 0
    ) {
      const currentCharacter = this.getActiveCharacter(0);
      const previousCharacter = this.getActiveCharacter(-1);
      currentCharacter.state = 'pristine';
      previousCharacter.entered = '';
      previousCharacter.display =
        previousCharacter.content === CHAR_CONSTANTS.NEWLINE.actual
          ? CHAR_CONSTANTS.NEWLINE.display
          : previousCharacter.content;
      if (previousCharacter.state === 'correct') {
        this.stats.correct--;
      } else if (previousCharacter.state === 'incorrect') {
        this.stats.incorrect--;
      }

      this.decrementCursor();
    }
  }

  // If no index is provided, return current character at activeIndex
  private getActiveCharacter(index) {
    let paragraphCursor = this.activeStory.paragraphCursor;
    let wordCursor = this.activeStory.wordCursor;
    let characterCursor = this.activeStory.characterCursor;
    // Detect character spillover
    if (
      characterCursor + index >
      this.activeStory.paragraphs[paragraphCursor].words[wordCursor].characters
        .length
    ) {
      // Character after this is in next word
      wordCursor = wordCursor + 1;
      characterCursor = 0;
    } else if (characterCursor + index < 0) {
      // Character before this is in previous word
      wordCursor = wordCursor - 1;
      if (wordCursor < 0) {
        // Word before this is in previous word
        paragraphCursor = paragraphCursor - 1;
        wordCursor =
          this.activeStory.paragraphs[paragraphCursor].words.length - 1;
        characterCursor =
          this.activeStory.paragraphs[paragraphCursor].words[wordCursor]
            .characters.length - 1;
      } else {
        characterCursor =
          this.activeStory.paragraphs[paragraphCursor].words[wordCursor]
            .characters.length - 1;
      }
    } else {
      characterCursor = characterCursor + index;
    }
    // Detect word spillover
    if (
      wordCursor > this.activeStory.paragraphs[paragraphCursor].words.length
    ) {
      paragraphCursor = paragraphCursor + 1;
      wordCursor = 0;
      characterCursor = 0;
    }

    return this.activeStory.paragraphs[paragraphCursor].words[wordCursor]
      .characters[characterCursor];
  }

  private decrementCursor() {
    let currentParagraph = this.activeStory.paragraphs[
      this.activeStory.paragraphCursor
    ];
    const currentWord = currentParagraph.words[this.activeStory.wordCursor];
    const currentCharacter = currentWord[this.activeStory.characterCursor];
    // detect overflow into next word
    if (this.activeStory.characterCursor - 1 < 0) {
      this.activeStory.wordCursor--;
      if (this.activeStory.wordCursor < 0) {
        console.log('previous para');
        this.activeStory.paragraphCursor--;
        currentParagraph = this.activeStory.paragraphs[
          this.activeStory.paragraphCursor
        ];
        currentParagraph.isClosed = false;
        this.activeStory.wordCursor = currentParagraph.words.length - 1;
      }
      this.activeStory.characterCursor =
        currentParagraph.words[this.activeStory.wordCursor].characters.length -
        1;
    } else {
      this.activeStory.characterCursor--;
    }

    if (this.activeStory.wordCursor >= currentParagraph.words.length) {
      this.activeStory.paragraphCursor++;
      this.activeStory.wordCursor = 0;
      this.activeStory.characterCursor = 0;
    }
  }

  private incrementCursor() {
    const currentParagraph = this.activeStory.paragraphs[
      this.activeStory.paragraphCursor
    ];
    const currentWord = currentParagraph.words[this.activeStory.wordCursor];
    const currentCharacter: CharacterInterface =
      currentWord.characters[this.activeStory.characterCursor];
    // detect overflow into next word
    if (this.activeStory.characterCursor + 1 >= currentWord.characters.length) {
      this.activeStory.wordCursor++;
      this.activeStory.characterCursor = 0;
    } else {
      this.activeStory.characterCursor++;
    }

    if (this.activeStory.wordCursor >= currentParagraph.words.length) {
      this.activeStory.paragraphCursor++;
      this.activeStory.wordCursor = 0;
      this.activeStory.characterCursor = 0;
    }

    // If current character is newline, then mark current paragraph as closed
    if (currentCharacter.content === CHAR_CONSTANTS.NEWLINE.actual) {
      currentParagraph.isClosed = true;
    }
  }
}
