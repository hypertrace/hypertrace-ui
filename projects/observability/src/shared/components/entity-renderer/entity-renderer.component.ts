import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';
import { Entity } from '../../graphql/model/schema/entity';
import { EntityIconLookupService } from '../../services/entity/entity-icon-lookup.service';
import { EntityNavigationService } from '../../services/navigation/entity/entity-navigation.service';

@Component({
  selector: 'ht-entity-renderer',
  styleUrls: ['./entity-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="this.name"
      class="ht-entity-renderer"
      [ngClass]="{ navigable: this.navigable, 'inherit-text-color': this.inheritTextColor }"
      [htTooltip]="this.name"
      (click)="this.navigable && this.onClickNavigate()"
    >
      <ht-icon
        [icon]="this.entityIconType"
        class="icon"
        *ngIf="this.showIcon && this.entityIconType"
        size="${IconSize.Large}"
      ></ht-icon>
      <div class="name" *ngIf="this.name" data-sensitive-pii>{{ this.name }}</div>
    </div>
    <div *ngIf="!this.name">-</div>
  `
})
export class EntityRendererComponent implements OnChanges {
  @Input()
  public entity?: Entity;

  @Input()
  public inactive: boolean = false;

  @Input()
  public navigable: boolean = true;

  @Input()
  public icon?: string;

  @Input()
  public showIcon: boolean = false;

  @Input()
  public inheritTextColor: boolean = false;

  public name?: string;
  public entityIconType?: string;

  public constructor(
    private readonly iconLookupService: EntityIconLookupService,
    private readonly entityNavService: EntityNavigationService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.entity) {
      this.setName();
      this.setIconType();
    }

    if (changes.icon) {
      this.setIconType();
    }
  }

  public onClickNavigate(): void {
    this.navigable && this.entity && this.entityNavService.navigateToEntity(this.entity, this.inactive);
  }

  private setName(): void {
    this.name = this.entity?.name as string;
  }

  private setIconType(): void {
    this.entityIconType =
      this.icon ?? (this.entity !== undefined ? this.iconLookupService.forEntity(this.entity) : undefined);
  }
}
