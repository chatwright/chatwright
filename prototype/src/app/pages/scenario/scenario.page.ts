import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'cw-scenario-page',
  imports: [ButtonModule, ProgressBarModule, RouterLink, TagModule, TooltipModule],
  templateUrl: './scenario.page.html',
  styleUrl: './scenario.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenarioPage {}
