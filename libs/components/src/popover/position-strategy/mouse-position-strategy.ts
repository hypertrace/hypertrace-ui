import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  OverlayRef,
  PositionStrategy
} from '@angular/cdk/overlay';
import { fromEvent, Subscription } from 'rxjs';

export class MousePositionStrategy implements PositionStrategy {
  private subscription?: Subscription;

  public constructor(
    private readonly containingElement: Element,
    private readonly flexibleStrategy: FlexibleConnectedPositionStrategy,
    private readonly offsetX: number = 20,
    private readonly offsetY: number = 20
  ) {
    this.configureFlexiblePosition();
  }

  public attach(overlayRef: OverlayRef): void {
    this.flexibleStrategy.attach(overlayRef);
    this.subscription = fromEvent<MouseEvent>(this.containingElement, 'mousemove').subscribe(event =>
      this.onMouseMove(event)
    );
  }

  public detach(): void {
    this.flexibleStrategy.detach();
    this.subscription && this.subscription.unsubscribe();
  }

  public apply(): void {
    this.flexibleStrategy.apply();
  }

  public dispose(): void {
    this.flexibleStrategy.dispose();
    this.subscription && this.subscription.unsubscribe();
  }

  private onMouseMove(event: MouseEvent): void {
    this.flexibleStrategy.positions.forEach(position =>
      this.updatePositionPair(position, event, this.offsetX, this.offsetY)
    );

    this.flexibleStrategy.apply();
  }

  private configureFlexiblePosition(): void {
    this.flexibleStrategy
      .withPositions([
        // Top Left
        new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'end', overlayY: 'bottom' }),
        // Top Right
        new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }),
        // Bottom Left
        new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'end', overlayY: 'top' }),
        // Bottom Right
        new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'top' })
      ])
      .withFlexibleDimensions(false)
      .withGrowAfterOpen(false);
  }

  private updatePositionPair(pair: ConnectionPositionPair, event: MouseEvent, offsetX: number, offsetY: number): void {
    const correctedOffsetY = pair.overlayY === 'bottom' ? -offsetY : offsetY;
    const correctedOffsetX = pair.overlayX === 'end' ? -offsetX : offsetX;
    pair.offsetX = event.offsetX + correctedOffsetX;
    pair.offsetY = event.offsetY + correctedOffsetY;
  }
}
