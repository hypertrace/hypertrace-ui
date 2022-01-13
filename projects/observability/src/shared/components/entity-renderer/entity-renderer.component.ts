import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { InAppNavigationParams, TypedSimpleChanges } from '@hypertrace/common';
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
      [ngClass]="{ 'default-text-style': !this.inheritTextStyle }"
      [htTooltip]="this.name"
    >
      <div *ngIf="this.navigationParams; then nameWithLinkTemplate; else nameTemplate"></div>
    </div>

    <ng-template #nameWithLinkTemplate>
      <ht-link [paramsOrUrl]="this.navigationParams" class="fill-container">
        <ng-container *ngTemplateOutlet="nameTemplate"></ng-container>
      </ht-link>
    </ng-template>

    <ng-template #nameTemplate>
      <div class="name-with-icon fill-container">
        <ht-icon
          [icon]="this.entityIconType"
          [color]="this.iconColor"
          class="icon"
          *ngIf="this.showIcon && this.entityIconType"
          size="${IconSize.Large}"
        ></ht-icon>
        <div class="name" data-sensitive-pii>{{ this.name | htDisplayString }}</div>
      </div>
    </ng-template>
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
  public iconColor?: string;

  @Input()
  public showIcon: boolean = false;

  @Input()
  public inheritTextStyle: boolean = false;

  public name?: string;
  public entityIconType?: string;
  public navigationParams?: InAppNavigationParams;

  public constructor(
    private readonly iconLookupService: EntityIconLookupService,
    private readonly entityNavService: EntityNavigationService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.entity) {
      this.setName();
      this.setIconType();
      this.setNavigationParams();
    }

    if (changes.icon) {
      this.setIconType();
    }
  }

  private setName(): void {
    this.name = this.entity?.name as string;
  }

  private setIconType(): void {
    this.entityIconType =
      this.icon ?? (this.entity !== undefined ? this.iconLookupService.forEntity(this.entity) : undefined);
  }

  private setNavigationParams(): void {
    this.navigationParams =
      this.navigable && this.entity !== undefined
        ? this.entityNavService.buildEntityDetailNavigationParams(this.entity, this.inactive)
        : undefined;
  }
}
