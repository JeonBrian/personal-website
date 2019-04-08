export class StoryInterface {
  name: string;
  content: string;
}

export class ActiveStoryInterface {
  name: string;
  content: string;
  characters: CharacterInterface[];
  cursorIndex: number;
}

export class CharacterInterface {
  content: string;
  state: string;
  entered: string;
  display: string;
}
