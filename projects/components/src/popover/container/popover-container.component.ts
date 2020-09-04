import { ChangeDetectionStrategy, Component, Inject, InjectionToken, Injector, TemplateRef, Type } from '@angular/core';
import { LayoutChangeService } from '@hypertrace/common';
import { POPOVER_DATA } from '../popover';

export const POPOVER_CONTAINER_DATA = new InjectionToken<PopoverContainerData>('POPOVER_CONTAINER_DATA');

@Component({
  selector: 'htc-popover-container',
  styleUrls: ['./popover-container.component.scss'],
  providers: [LayoutChangeService], // Provided here since popovers are in detached state
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="this.isComponentRenderer; else templateRenderer">
      <ng-container *ngComponentOutlet="this.containerData.popoverRenderer; injector: this.componentInjector">
      </ng-container>
    </ng-container>
    <ng-template #templateRenderer>
      <ng-container *ngTemplateOutlet="this.containerData.popoverRenderer; context: this.templateContext">
      </ng-container>
    </ng-template>
  `
})
export class PopoverContainerComponent {
  public readonly isComponentRenderer: boolean;
  public readonly templateContext: unknown;
  public readonly componentInjector: Injector;
  public constructor(
    @Inject(POPOVER_CONTAINER_DATA)
    public readonly containerData: PopoverContainerData,
    layoutChangeService: LayoutChangeService
  ) {
    this.isComponentRenderer = !(containerData.popoverRenderer instanceof TemplateRef);
    // tslint:disable-next-line: no-null-keyword Required so angular doesn't default to throw
    this.templateContext = this.containerData.popoverInjector.get(POPOVER_DATA, null);

    this.componentInjector = Injector.create({
      providers: [
        {
          provide: LayoutChangeService,
          useValue: layoutChangeService
        }
      ],
      parent: this.containerData.popoverInjector
    });
  }
}

export interface PopoverContainerData {
  popoverRenderer: Type<unknown> | TemplateRef<unknown>;
  popoverInjector: Injector;
}
