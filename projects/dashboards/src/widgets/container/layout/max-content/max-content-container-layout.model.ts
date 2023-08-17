import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { ContainerLayout, ContainerLayoutData } from '../container-layout';

@Model({
  type: 'max-content-container-layout'
})
export class MaxContentContainerLayoutModel extends ContainerLayout {
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

  public getContainerLayoutData(children: object[]): ContainerLayoutData {
    const gridDimension = this.getGridDimensions(children.length);

    return {
      rows: `repeat(${gridDimension[0]}, max-content)`,
      columns: `repeat(${gridDimension[1]}, max-content))`,
      gap: `${this.gridGap}`,
      enableStyle: this.enableStyle,
      children: children.map(child => ({ model: child, areaSpan: '' }))
    };
  }

  private getGridDimensions(totalChildren: number): [number, number] {
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
