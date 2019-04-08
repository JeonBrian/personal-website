import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypingTestGameComponent } from './typing-test-game.component';

describe('TypingTestGameComponent', () => {
  let component: TypingTestGameComponent;
  let fixture: ComponentFixture<TypingTestGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TypingTestGameComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypingTestGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
