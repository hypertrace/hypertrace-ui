import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { isEmpty } from 'lodash-es';
import { ButtonRole, ButtonSize, ButtonStyle } from '../button/button';
import { TitledHeaderControlDirective } from './header-controls/titled-header-control.directive';

@Component({
  selector: 'ht-titled-content',
  styleUrls: ['./titled-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="titled-content-container">
      <div class="header" [ngClass]="this.headerPosition" [htLayoutChangeTrigger]="this.shouldShowHeader">
        <ht-label
          *ngIf="this.shouldShowTitleInHeader"
          [ngClass]="this.titleStyle"
          [label]="this.title"
          class="title"
        ></ht-label>
        <ht-link [paramsOrUrl]="this.link" class="link" [ngClass]="this.titleStyle" *ngIf="this.link">
          <ht-button
            *ngIf="this.linkButtonStyle === '${LinkButtonStyle.Primary}'"
            [label]="this.linkLabel"
            role="${ButtonRole.Primary}"
            display="${ButtonStyle.Text}"
            size="${ButtonSize.ExtraSmall}"
            icon="${IconType.ChevronRight}"
            [trailingIcon]="true"
          ></ht-button>
          <ht-button
            *ngIf="this.linkButtonStyle === '${LinkButtonStyle.Quaternary}'"
            [label]="this.linkLabel"
            role="${ButtonRole.Quaternary}"
            display="${ButtonStyle.Solid}"
            size="${ButtonSize.ExtraSmall}"
            icon="${IconType.ChevronRight}"
            [trailingIcon]="true"
          ></ht-button>
        </ht-link>
        <div *ngIf="!!this.headerControl" class="controls">
          <ng-container *ngTemplateOutlet="this.headerControl!.getTemplateRef()"></ng-container>
        </div>
      </div>
      <div class="content">
        <ng-content></ng-content>
      </div>
      <div class="footer" *ngIf="this.shouldShowTitleInFooter">
        <ht-label [ngClass]="this.titleStyle" [label]="this.title" class="title"></ht-label>
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
  public titleStyle: TitleStyle = TitleStyle.Regular;

  @Input()
  public hideTitle: boolean = false;

  @Input()
  public link?: string;

  @Input()
  public linkButtonStyle: LinkButtonStyle = LinkButtonStyle.Primary;

  @Input()
  public headerPosition: HeaderPosition = HeaderPosition.Center;

  @Input()
  public linkLabel?: string;

  public get shouldShowHeader(): boolean {
    return this.shouldShowTitleInHeader || this.headerControl !== undefined;
  }

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

export const enum TitleStyle {
  Regular = 'regular',
  GrayedOut = 'grayed-out'
}

export const enum LinkButtonStyle {
  Primary = 'primary',
  Quaternary = 'quaternary'
}

export const enum HeaderPosition {
  Center = 'center',
  SpaceBetween = 'space-between'
}
