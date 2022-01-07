import { Directive, EmbeddedViewRef, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureState } from '@hypertrace/common';
import { isNil } from 'lodash-es';

@Directive({
  selector: '[htIfFeature]'
})
export class IfFeatureDirective implements OnChanges {
  @Input('htIfFeature')
  public featureState?: FeatureState;

  // tslint:disable-next-line:no-input-rename
  @Input('htIfFeatureElse')
  public elseContent?: TemplateRef<unknown>;

  private embeddedViewRef?: EmbeddedViewRef<FeatureFlagsContext | unknown>;
  private readonly context: FeatureFlagsContext = {
    htIfFeature: FeatureState.Disabled,
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
    this.context.htIfFeature = state;
    if (state === FeatureState.Disabled) {
      if (!isNil(this.elseContent)) {
        this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.elseContent);
      } else {
        // If shouldn't be rendered, destroy if exists
        this.clearView();
      }
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
  htIfFeature: FeatureState;
  $implicit: FeatureState;
}
