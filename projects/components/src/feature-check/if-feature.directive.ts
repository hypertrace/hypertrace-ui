import { Directive, EmbeddedViewRef, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureState } from '@hypertrace/common';
import { isNil } from 'lodash-es';

@Directive({
  selector: '[htcIfFeature]'
})
export class IfFeatureDirective implements OnChanges {
  @Input('htcIfFeature')
  public featureState?: FeatureState;

  private embeddedViewRef?: EmbeddedViewRef<FeatureFlagsContext>;
  private readonly context: FeatureFlagsContext = {
    htcIfFeature: FeatureState.Disabled,
    $implicit: FeatureState.Disabled
  };

  public constructor(
    private readonly viewContainer: ViewContainerRef,
    private readonly templateRef: TemplateRef<FeatureFlagsContext>
  ) {}

  public ngOnChanges(): void {
    this.updateView(isNil(this.featureState) ? FeatureState.Disabled : this.featureState);
  }

  private updateView(state: FeatureState): void {
    this.context.$implicit = state;
    this.context.htcIfFeature = state;
    if (state === FeatureState.Disabled) {
      // If shouldn't be rendered, destroy if exists
      this.clearView();
    } else if (!this.embeddedViewRef) {
      // Should be rendered but isnt
      this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
    } else {
      // Already rendered, just update
      this.embeddedViewRef.markForCheck();
    }
  }

  private clearView(): void {
    this.embeddedViewRef && this.embeddedViewRef.destroy();
    this.embeddedViewRef = undefined;
  }
}

interface FeatureFlagsContext {
  htcIfFeature: FeatureState;
  $implicit: FeatureState;
}
