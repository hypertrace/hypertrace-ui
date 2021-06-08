import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../content/content-holder';

@Component({
  selector: 'ht-navigable-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CONTENT_HOLDER_TEMPLATE
})
export class NavigableTabComponent extends ContentHolder {
  public constructor(private readonly navService: NavigationService, private readonly activatedRoute: ActivatedRoute) {
    super();
  }
  @Input()
  public path!: string;

  @Input()
  public hidden: boolean = false;

  @Input()
  public labelTag?: string;

  @Input()
  public replaceHistory?: boolean;

  @Input()
  public features: string[] = [];

  public get featureFlags(): string[] {
    return [...this.routeFeatures(), ...this.features];
  }

  private routeFeatures(): string[] {
    const route = this.navService.getRouteConfig([this.path], this.activatedRoute);

    return (route && route.data && route.data.features) || [];
  }
}
