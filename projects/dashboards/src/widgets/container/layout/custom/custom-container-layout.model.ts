import { ARRAY_PROPERTY, Model, ModelProperty } from '@hypertrace/hyperdash';
import { ContainerLayout, ContainerLayoutChildData, ContainerLayoutData } from '../container-layout';
import { CellSpanModel } from './cell-span/cell-span.model';
import { CellDimension } from './dimension/dimension.model';

@Model({
  type: 'custom-container-layout'
})
export class CustomContainerLayoutModel extends ContainerLayout {
  @ModelProperty({
    key: 'column-dimensions',
    type: ARRAY_PROPERTY.type,
    required: true
  })
  public readonly columnDimensions!: CellDimension[];

  @ModelProperty({
    key: 'row-dimensions',
    type: ARRAY_PROPERTY.type,
    required: true
  })
  public readonly rowDimensions!: CellDimension[];

  @ModelProperty({
    key: 'cell-spans',
    type: ARRAY_PROPERTY.type,
    required: true
  })
  public readonly cellSpans!: CellSpanModel[];

  public getContainerLayoutData(children: object[]): ContainerLayoutData {
    return {
      rows: this.getRowStyles(),
      columns: this.getColumnStyles(),
      gap: `${this.gridGap}`,
      enableStyle: this.enableStyle,
      children: this.getChildLayoutData(children)
    };
  }

  private getColumnStyles(): string {
    return this.columnDimensions.map(colDimension => colDimension.getDimensionAsGridStyle()).join(' ');
  }

  private getRowStyles(): string {
    return this.rowDimensions.map(rowDimension => rowDimension.getDimensionAsGridStyle()).join(' ');
  }

  private getChildLayoutData(children: object[]): ContainerLayoutChildData[] {
    return children.map((child, index) => ({
      model: child,
      areaSpan: this.cellSpans[index].toString()
    }));
  }
}
