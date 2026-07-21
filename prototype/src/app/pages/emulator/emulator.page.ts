import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { DemoLanguage, DemoStore } from '../../demo.store';

type ChatID = 'alice-greeter' | 'bob-reminder' | 'launch-crew';

interface ChatPreview {
  id: ChatID;
  actor: string;
  bot: string;
  initials: string;
  accent: 'mint' | 'blue' | 'violet';
  preview: string;
  time: string;
  unread?: number;
  group?: boolean;
}

@Component({
  selector: 'cw-emulator-page',
  imports: [
    AvatarModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    RouterLink,
    SelectModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './emulator.page.html',
  styleUrl: './emulator.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmulatorPage {
  readonly store: DemoStore;
  activeChat: ChatID = 'alice-greeter';

  readonly chats: ChatPreview[] = [
    {
      id: 'alice-greeter',
      actor: 'Alice',
      bot: 'Greeter bot',
      initials: 'AL',
      accent: 'mint',
      preview: 'Howdy stranger! Choose a language…',
      time: 'now'
    },
    {
      id: 'bob-reminder',
      actor: 'Bob',
      bot: 'Reminder bot',
      initials: 'BO',
      accent: 'blue',
      preview: 'Renew car insurance in 6 days.',
      time: '2m',
      unread: 1
    },
    {
      id: 'launch-crew',
      actor: 'Launch crew',
      bot: 'Group chat · 3 actors',
      initials: 'LC',
      accent: 'violet',
      preview: '1 scenario still failing.',
      time: '8m',
      group: true
    }
  ];

  constructor(store: DemoStore) {
    this.store = store;
  }

  selectChat(chatID: ChatID): void {
    this.activeChat = chatID;
  }

  translate(code: DemoLanguage['code']): void {
    this.store.translateGreeting(code);
  }

  reset(): void {
    this.activeChat = 'alice-greeter';
    this.store.resetRun();
  }
}
