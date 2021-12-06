import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { ContainerLayout, ContainerLayoutData } from '../container-layout';

@Model({
  type: 'auto-container-layout'
})
export class AutoContainerLayoutModel extends ContainerLayout {
  @ModelProperty({
    key: 'columns',
    type: NUMBER_PROPERTY.type,
    required: false
  })
  public numberColumns?: number;

  @ModelProperty({
    key: 'rows',
    type: NUMBER_PROPERTY.type,
    required: false
  })
  public numberRows?: number;

  @ModelProperty({
    key: 'min-column-width',
    type: NUMBER_PROPERTY.type,
    required: false
  })
  public minColumnWidth: number = 50;

  @ModelProperty({
    key: 'min-row-height',
    type: NUMBER_PROPERTY.type,
    required: false
  })
  public minRowHeight: number = 50;

  public getContainerLayoutData(children: object[]): ContainerLayoutData {
    const gridDimension = this.getAutoGridDimensions(children.length);

    return {
      rows: `repeat(${gridDimension[0]}, minmax(${this.minRowHeight}px, 1fr))`,
      columns: `repeat(${gridDimension[1]}, minmax(${this.minColumnWidth}px, 1fr))`,
      gap: `${this.gridGap}`,
      enableStyle: this.enableStyle,
      children: children.map(child => ({ model: child, areaSpan: '' }))
    };
  }

  private getAutoGridDimensions(totalChildren: number): [number, number] {
    let rows = this.numberRows;
    let columns = this.numberColumns;

    if (this.numberRows === undefined && this.numberColumns !== undefined) {
      rows = Math.ceil(totalChildren / this.numberColumns);
    } else if (this.numberRows !== undefined && this.numberColumns === undefined) {
      columns = Math.ceil(totalChildren / this.numberRows);
    } else if (this.numberRows === undefined && this.numberColumns === undefined) {
      columns = 1;
      rows = totalChildren;
    }

    return [rows, columns] as [number, number];
  }
}
