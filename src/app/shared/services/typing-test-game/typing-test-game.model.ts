export class StoryInterface {
  name: string;
  content: string;
}

export class ActiveStoryInterface {
  name: string;
  content: string;
  paragraphs: ParagraphInterface[];
  paragraphCursor: number;
  wordCursor: number;
  characterCursor: number;
}

export class ParagraphInterface {
  isClosed: boolean;
  words: WordInterface[];
}

export class WordInterface {
  characters: CharacterInterface[];
}

export class CharacterInterface {
  content: string;
  state: string;
  entered: string;
  display: string;
}
