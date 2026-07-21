import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { DemoStore } from '../../demo.store';

interface AssertionRow {
  assertion: string;
  expected: string;
  actual: string;
  latency: string;
  status: 'Passed';
}

@Component({
  selector: 'cw-run-page',
  imports: [ButtonModule, ProgressBarModule, RouterLink, TableModule, TagModule, TooltipModule],
  templateUrl: './run.page.html',
  styleUrl: './run.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunPage {
  readonly store: DemoStore;
  selectedTraceIndex = 2;

  constructor(store: DemoStore) {
    this.store = store;
  }

  get assertions(): AssertionRow[] {
    return [
      {
        assertion: 'Bot message arrives',
        expected: 'within 1 s',
        actual: 'message 27',
        latency: '49 ms',
        status: 'Passed'
      },
      {
        assertion: 'Greeting text',
        expected: 'contains “Howdy stranger”',
        actual: 'matched',
        latency: '—',
        status: 'Passed'
      },
      {
        assertion: 'Language action',
        expected: 'label + semantic ID',
        actual: this.store.selectedLanguage().callbackID,
        latency: '17 ms',
        status: 'Passed'
      },
      {
        assertion: 'In-place edit',
        expected: `same ID · ${this.store.selectedLanguage().shortLabel}`,
        actual: `message 27 · v${this.store.messageVersion()}`,
        latency: this.store.messageVersion() > 1 ? '58 ms' : 'not replayed',
        status: 'Passed'
      }
    ];
  }

  selectTrace(index: number): void {
    this.selectedTraceIndex = index;
  }
}
