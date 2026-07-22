import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  signal,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';

import { DemoLanguage, DemoStore, TraceEvent } from '../../demo.store';

hljs.registerLanguage('json', json);

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

interface SentChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
}

@Component({
  selector: 'cw-emulator-page',
  imports: [
    AvatarModule,
    ButtonModule,
    InputTextModule,
    RouterLink,
    TagModule,
    TooltipModule
  ],
  templateUrl: './emulator.page.html',
  styleUrl: './emulator.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmulatorPage {
  readonly store: DemoStore;
  readonly messageCanvas = viewChild<ElementRef<HTMLElement>>('messageCanvas');
  readonly composerInput = viewChild<ElementRef<HTMLInputElement>>('composerInput');
  readonly activeChat = signal<ChatID>('alice-greeter');
  readonly drafts = signal<Record<ChatID, string>>({
    'alice-greeter': '',
    'bob-reminder': '',
    'launch-crew': ''
  });
  readonly sentMessages = signal<Record<ChatID, SentChatMessage[]>>({
    'alice-greeter': [],
    'bob-reminder': [],
    'launch-crew': []
  });
  readonly activeDraft = computed(() => this.drafts()[this.activeChat()]);
  readonly activeSentMessages = computed(() => this.sentMessages()[this.activeChat()]);
  readonly tracePreview = signal<TraceEvent | null>(null);
  readonly tracePreviewTop = signal(0);
  readonly tracePreviewLeft = signal(0);
  readonly highlightedTracePayload = computed(() => {
    const preview = this.tracePreview();
    return preview
      ? hljs.highlight(JSON.stringify(preview.payload, null, 2), { language: 'json' }).value
      : '';
  });
  private readonly sentMessageSequence = signal(0);

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
    this.activeChat.set(chatID);
  }

  translate(code: DemoLanguage['code']): void {
    this.store.translateGreeting(code);
  }

  showTracePreview(domEvent: MouseEvent | FocusEvent, event: TraceEvent): void {
    const target = domEvent.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const width = Math.min(512, window.innerWidth - 32);
    const height = Math.min(500, window.innerHeight - 32);

    this.tracePreviewLeft.set(Math.max(16, rect.left - width - 12));
    this.tracePreviewTop.set(Math.min(Math.max(16, rect.top - 8), window.innerHeight - height - 16));
    this.tracePreview.set(event);
  }

  hideTracePreview(): void {
    this.tracePreview.set(null);
  }

  updateDraft(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    const chatID = this.activeChat();
    this.drafts.update((drafts) => ({ ...drafts, [chatID]: text }));
  }

  sendMessage(): void {
    const text = this.activeDraft().trim();
    if (!text) {
      return;
    }

    const chatID = this.activeChat();
    const sequence = this.sentMessageSequence() + 1;
    const author = chatID === 'bob-reminder' ? 'Bob' : 'Alice';
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());

    this.sentMessageSequence.set(sequence);
    this.sentMessages.update((messages) => ({
      ...messages,
      [chatID]: [
        ...messages[chatID],
        { id: `${chatID}-${sequence}`, author, text, time }
      ]
    }));
    this.drafts.update((drafts) => ({ ...drafts, [chatID]: '' }));
    const composer = this.composerInput()?.nativeElement;
    if (composer) {
      composer.value = '';
    }

    requestAnimationFrame(() => {
      const canvas = this.messageCanvas()?.nativeElement;
      canvas?.scrollTo({ top: canvas.scrollHeight, behavior: 'smooth' });
    });
  }

  reset(): void {
    this.activeChat.set('alice-greeter');
    this.drafts.set({ 'alice-greeter': '', 'bob-reminder': '', 'launch-crew': '' });
    this.sentMessages.set({ 'alice-greeter': [], 'bob-reminder': [], 'launch-crew': [] });
    this.sentMessageSequence.set(0);
    this.tracePreview.set(null);
    this.store.resetRun();
  }
}
