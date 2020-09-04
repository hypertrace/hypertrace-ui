import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { isEmpty } from 'lodash-es';
import { ButtonRole, ButtonSize, ButtonStyle } from '../button/button';
import { TitledHeaderControlDirective } from './header-controls/titled-header-control.directive';

@Component({
  selector: 'htc-titled-content',
  styleUrls: ['./titled-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="titled-content-container">
      <div class="header">
        <htc-label *ngIf="this.shouldShowTitleInHeader" [label]="this.title" class="title"></htc-label>
        <htc-link [url]="this.link" class="link" *ngIf="this.link">
          <htc-button
            [label]="this.linkLabel"
            role="${ButtonRole.Primary}"
            display="${ButtonStyle.Text}"
            size="${ButtonSize.Small}"
            icon="${IconType.ChevronRight}"
            [trailingIcon]="true"
          ></htc-button>
        </htc-link>
        <div *ngIf="!!this.headerControl" class="controls">
          <ng-container *ngTemplateOutlet="this.headerControl!.getTemplateRef()"></ng-container>
        </div>
      </div>
      <div class="content">
        <ng-content></ng-content>
      </div>
      <div class="footer">
        <htc-label *ngIf="this.shouldShowTitleInFooter" [label]="this.title" class="title"></htc-label>
      </div>
    </div>
  `
})
export class TitledContentComponent {
  @Input()
  public title?: string;

  @Input()
  public titlePosition: TitlePosition = TitlePosition.Header;

  @Input()
  public hideTitle: boolean = false;

  @Input()
  public link?: string;

  @Input()
  public linkLabel?: string;

  private get shouldShowTitle(): boolean {
    return !isEmpty(this.title) && !this.hideTitle;
  }

  public get shouldShowTitleInHeader(): boolean {
    return this.shouldShowTitle && this.titlePosition !== TitlePosition.Footer;
  }

  public get shouldShowTitleInFooter(): boolean {
    return this.shouldShowTitle && this.titlePosition === TitlePosition.Footer;
  }

  @ContentChild(TitledHeaderControlDirective)
  public readonly headerControl?: TitledHeaderControlDirective;
}

export const enum TitlePosition {
  Header = 'header',
  Footer = 'footer'
}
