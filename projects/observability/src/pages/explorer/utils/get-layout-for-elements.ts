function generateColumnDimensions(columns: number): ColumnDimension[] {
  const columnDimensions = [];

  for (let i = 0; i < columns; i++) {
    columnDimensions.push({
      type: 'dimension-model',
      dimension: 1,
      unit: 'FR'
    });
  }

  return columnDimensions;
}

export function getLayoutForElements(numberOfElements: number): object {
  if (numberOfElements < 2) {
    // 3 x 3 grid
    return {
      type: 'custom-container-layout',
      'column-dimensions': generateColumnDimensions(3),
      'row-dimensions': [
        {
          type: 'dimension-model',
          dimension: 1,
          unit: 'FR'
        },
        {
          type: 'dimension-model',
          dimension: 2,
          unit: 'FR'
        },
        {
          type: 'dimension-model',
          dimension: 1,
          unit: 'FR'
        }
      ],
      'cell-spans': [
        {
          // First row
          type: 'cell-span-model',
          'col-start': 1,
          'col-end': 2,
          'row-start': 1,
          'row-end': 2
        }
      ],
      'enable-style': true,
      'grid-gap': '0'
    };
  }

  if (numberOfElements < 5) {
    // 3 x 4 grid
    return {
      type: 'custom-container-layout',
      'column-dimensions': generateColumnDimensions(4),
      'row-dimensions': [
        {
          type: 'dimension-model',
          dimension: 1,
          unit: 'FR'
        },
        {
          type: 'dimension-model',
          dimension: 2,
          unit: 'FR'
        },
        {
          type: 'dimension-model',
          dimension: 1,
          unit: 'FR'
        }
      ],
      'cell-spans': [
        {
          // First row
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 1,
          'row-end': 2
        },
        {
          // First row
          type: 'cell-span-model',
          'col-start': 1,
          'col-end': 2,
          'row-start': 1,
          'row-end': 2
        },
        {
          // First row
          type: 'cell-span-model',
          'col-start': 2,
          'col-end': 3,
          'row-start': 1,
          'row-end': 2
        },
        {
          // First row
          type: 'cell-span-model',
          'col-start': 3,
          'col-end': 4,
          'row-start': 1,
          'row-end': 2
        }
      ],
      'enable-style': true,
      'grid-gap': '0'
    };
  }

  return {
    // 2 x 4 grid
    type: 'custom-container-layout',
    'column-dimensions': generateColumnDimensions(4),
    'row-dimensions': [
      {
        type: 'dimension-model',
        dimension: 124,
        unit: 'PX'
      },
      {
        type: 'dimension-model',
        dimension: 124,
        unit: 'PX'
      }
    ],
    'cell-spans': [
      {
        // First row
        type: 'cell-span-model',
        'col-start': 0,
        'col-end': 1,
        'row-start': 0,
        'row-end': 1
      },
      {
        type: 'cell-span-model',
        'col-start': 1,
        'col-end': 2,
        'row-start': 0,
        'row-end': 1
      },
      {
        type: 'cell-span-model',
        'col-start': 2,
        'col-end': 3,
        'row-start': 0,
        'row-end': 1
      },
      {
        type: 'cell-span-model',
        'col-start': 3,
        'col-end': 4,
        'row-start': 0,
        'row-end': 1
      },
      {
        // Second row
        type: 'cell-span-model',
        'col-start': 0,
        'col-end': 1,
        'row-start': 1,
        'row-end': 2
      },
      {
        type: 'cell-span-model',
        'col-start': 1,
        'col-end': 2,
        'row-start': 1,
        'row-end': 2
      },
      {
        type: 'cell-span-model',
        'col-start': 2,
        'col-end': 3,
        'row-start': 1,
        'row-end': 2
      },
      {
        type: 'cell-span-model',
        'col-start': 3,
        'col-end': 4,
        'row-start': 1,
        'row-end': 2
      }
    ],
    'enable-style': true,
    'grid-gap': '0'
  };
}

interface ColumnDimension {
  type: string;
  dimension: number;
  unit: string;
}
