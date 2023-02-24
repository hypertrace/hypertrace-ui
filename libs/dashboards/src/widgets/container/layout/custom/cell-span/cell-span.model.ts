import { Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'cell-span-model'
})
export class CellSpanModel {
  @ModelProperty({
    key: 'col-start',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public colStart!: number;

  @ModelProperty({
    key: 'col-end',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public colEnd!: number;

  @ModelProperty({
    key: 'row-start',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public rowStart!: number;

  @ModelProperty({
    key: 'row-end',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public rowEnd!: number;

  public toString(): string {
    return `${this.rowStart + 1} / ${this.colStart + 1} / ${this.rowEnd + 1} / ${this.colEnd + 1}`;
  }
}
