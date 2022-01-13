import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

interface ContainerClass {
  skeleton: boolean;
  'skeleton-circle': boolean;
  'skeleton-rectangle-text': boolean;
  'skeleton-none': boolean;
}

// TODO ENG-7872 type def container style
// TODO ENG-7872 strongly type with enums config options
@Component({
  selector: 'ht-skeleton',
  template: ` <div [ngClass]="containerClass()" [ngStyle]="containerStyle()"></div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./skeleton.scss']
})
export class SkeletonComponent implements OnInit {
  // Inline styles
  @Input() public style: any; // Must be any for spread operator

  @Input() public shapeStyle: string = 'rectangle';

  @Input() public animation: string = 'wave';

  @Input() public size: string = '';

  @Input() public width: string = '';

  @Input() public height: string = '';

  public ngOnInit() {
    // Set default dimensions for shapes
    switch (this.shapeStyle) {
      case 'rectangle': // Could remove this
        this.width = this.width ? this.width : '80%';
        this.height = this.height ? this.height : '80%';
        break;
      case 'rectangle-text':
        this.width = this.width ? this.width : '80%';
        this.height = this.height ? this.height : '1.3rem';
        break;
      case 'circle':
        this.width = this.width ? this.width : '3rem';
        this.height = this.height ? this.height : '3rem';
        break;
      default:
        this.width = this.width ? this.width : '80%';
        this.height = this.height ? this.height : '80%';
    }
  }

  public containerClass(): ContainerClass {
    return {
      skeleton: true,
      'skeleton-circle': this.shapeStyle === 'circle',
      'skeleton-rectangle-text': this.shapeStyle === 'rectangle-text',
      'skeleton-none': this.animation === 'none'
    };
  }

  public containerStyle() {
    if (!!this.size) {
      return {
        ...this.style,
        width: this.size,
        height: this.size
      };
    } else {
      return {
        ...this.style,
        width: this.width,
        height: this.height
      };
    }
  }
}
