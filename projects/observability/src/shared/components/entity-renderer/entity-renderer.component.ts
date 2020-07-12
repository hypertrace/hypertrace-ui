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
      class="ht-entity-renderer"
      [ngClass]="{ navigable: this.navigable }"
      [htcTooltip]="this.name"
      (click)="this.onClickNavigate()"
    >
      <htc-icon
        [icon]="this.entityIconType"
        class="icon"
        *ngIf="this.showIcon && this.entityIconType"
        size="${IconSize.Large}"
      ></htc-icon>
      <div class="name" *ngIf="this.name">{{ this.name }}</div>
    </div>
  `
})
export class EntityRendererComponent implements OnChanges {
  @Input()
  public entity!: Entity;

  @Input()
  public navigable: boolean = true;

  @Input()
  public showIcon: boolean = false;

  public name!: unknown;
  public entityIconType!: string;

  public constructor(
    private readonly iconLookupService: EntityIconLookupService,
    private readonly entityNavService: EntityNavigationService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.entity) {
      this.setName();
      this.setIconType();
    }
  }
  public onClickNavigate(): void {
    this.navigable && this.entityNavService.navigateToEntity(this.entity);
  }

  private setName(): void {
    this.name = this.entity.name as string;
  }

  private setIconType(): void {
    this.entityIconType = this.iconLookupService.forEntity(this.entity);
  }
}
