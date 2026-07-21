import { Injectable, computed, signal } from '@angular/core';

export interface DemoLanguage {
  code: 'en' | 'es' | 'uk' | 'fr';
  label: string;
  shortLabel: string;
  flag: string;
  greeting: string;
  callbackID: string;
}

export interface TraceEvent {
  time: string;
  kind: 'actor' | 'http' | 'api' | 'state' | 'assertion';
  title: string;
  detail: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DemoStore {
  readonly workspace = 'greetbot';
  readonly scenario = 'language-choice';
  readonly runID = 'run-1842';

  readonly languages: DemoLanguage[] = [
    {
      code: 'en',
      label: 'English',
      shortLabel: 'EN',
      flag: '🇬🇧',
      greeting: 'Howdy stranger! Choose a language for this conversation.',
      callbackID: 'lang:en'
    },
    {
      code: 'es',
      label: 'Español',
      shortLabel: 'ES',
      flag: '🇪🇸',
      greeting: '¡Hola, forastero! Elige un idioma para esta conversación.',
      callbackID: 'lang:es'
    },
    {
      code: 'uk',
      label: 'Українська',
      shortLabel: 'UK',
      flag: '🇺🇦',
      greeting: 'Привіт, мандрівнику! Обери мову для цієї розмови.',
      callbackID: 'lang:uk'
    },
    {
      code: 'fr',
      label: 'Français',
      shortLabel: 'FR',
      flag: '🇫🇷',
      greeting: 'Salut, voyageur ! Choisis la langue de cette conversation.',
      callbackID: 'lang:fr'
    }
  ];

  readonly selectedLanguageCode = signal<DemoLanguage['code']>('en');
  readonly messageVersion = signal(1);
  readonly editCount = signal(0);
  readonly lastEdited = signal<string | null>(null);

  readonly selectedLanguage = computed(
    () =>
      this.languages.find((language) => language.code === this.selectedLanguageCode()) ??
      this.languages[0]
  );

  readonly greeting = computed(() => this.selectedLanguage().greeting);

  readonly baseTraceEvents: TraceEvent[] = [
    {
      time: '00.000',
      kind: 'actor',
      title: 'Alice → “Hi”',
      detail: 'Scripted actor sent semantic text action.'
    },
    {
      time: '00.008',
      kind: 'http',
      title: 'POST /telegram/webhook',
      detail: 'Update 4102 · HTTP 200 · 18 ms'
    },
    {
      time: '00.041',
      kind: 'api',
      title: 'sendMessage',
      detail: 'Fake Bot API captured text + 4 actions.'
    },
    {
      time: '00.049',
      kind: 'assertion',
      title: 'Greeting matched',
      detail: 'Within 1 s · observed 49 ms'
    }
  ];

  readonly traceEvents = computed<TraceEvent[]>(() => {
    const language = this.selectedLanguage();
    const edited = this.messageVersion() > 1;
    if (!edited) {
      return this.baseTraceEvents;
    }
    return [
      ...this.baseTraceEvents,
      {
        time: '03.284',
        kind: 'actor',
        title: `Alice → ${language.label}`,
        detail: `Action ${language.callbackID}`
      },
      {
        time: '03.301',
        kind: 'http',
        title: 'POST /telegram/webhook',
        detail: 'Callback query 4103 · HTTP 200'
      },
      {
        time: '03.337',
        kind: 'api',
        title: 'editMessageText',
        detail: `Message 27 · ${language.shortLabel} · version ${this.messageVersion()}`,
        active: true
      },
      {
        time: '03.342',
        kind: 'assertion',
        title: 'In-place edit matched',
        detail: 'Same message ID · 58 ms · passed',
        active: true
      }
    ];
  });

  translateGreeting(code: DemoLanguage['code']): void {
    if (code === this.selectedLanguageCode()) {
      return;
    }
    this.selectedLanguageCode.set(code);
    this.messageVersion.update((version) => version + 1);
    this.editCount.update((count) => count + 1);
    this.lastEdited.set('just now');
  }

  resetRun(): void {
    this.selectedLanguageCode.set('en');
    this.messageVersion.set(1);
    this.editCount.set(0);
    this.lastEdited.set(null);
  }
}
