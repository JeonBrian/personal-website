import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TypingTestComponent } from './typing-test/typing-test.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { TypingTestGameComponent } from './shared/components/typing-test-game/typing-test-game.component';

@NgModule({
  declarations: [
    AppComponent,
    TypingTestComponent,
    HomeComponent,
    NavbarComponent,
    TypingTestGameComponent
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
