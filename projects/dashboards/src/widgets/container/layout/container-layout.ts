import { ComponentFactoryResolver, Injector, Type, ViewContainerRef } from '@angular/core';
import { BOOLEAN_PROPERTY, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ContainerLayoutComponent, CONTAINER_LAYOUT } from './container-layout.component';

// Make abstract so it exists at runtime and can be used by the dashboard system
export abstract class ContainerLayout {
  // TODO: drag, resize

  @ModelProperty({
    key: 'enable-style',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public enableStyle: boolean = true;

  @ModelProperty({
    key: 'grid-gap',
    type: STRING_PROPERTY.type,
    required: false
  })
  public gridGap: string = '16px';

  public abstract getContainerLayoutData(children: object[]): ContainerLayoutData;

  public draw(containerRef: ViewContainerRef, children: object[]): void {
    const resolver = containerRef.injector.get((ComponentFactoryResolver as unknown) as Type<ComponentFactoryResolver>);

    const containerFactory = resolver.resolveComponentFactory(ContainerLayoutComponent);
    const layoutData = this.getContainerLayoutData(children);

    containerRef.clear();
    containerRef.createComponent(
      containerFactory,
      undefined,
      this.createInjectorForContainer(containerRef, layoutData)
    );
  }

  private createInjectorForContainer(containerRef: ViewContainerRef, gridLayoutData: ContainerLayoutData): Injector {
    return Injector.create({
      providers: [
        {
          provide: CONTAINER_LAYOUT,
          useValue: gridLayoutData
        }
      ],
      parent: containerRef.injector
    });
  }
}

export interface ContainerLayoutChildData {
  areaSpan: string;
  model: object;
}

export interface ContainerLayoutData {
  gap: string;
  rows?: string;
  columns: string;
  enableStyle: boolean;
  children: ContainerLayoutChildData[];
}
