import { cloneDeep } from 'lodash-es';
import { of } from 'rxjs';
import {
  StatefulPrefetchedTreeTableRow,
  StatefulTableRow,
  StatefulTreeTableRow,
  TableRow,
  TableRowState,
  TreeTableRow
} from '../table-api';
import { TableCdkRowUtil } from './table-cdk-row-util';

// tslint:disable max-file-line-count
describe('Table row util', () => {
  let parentTableRow: TableRow;
  let childTableRow: TableRow;
  let grandchildTableRow: TableRow;
  let treeTableRow: TreeTableRow;
  let parentStatefulTableRow: StatefulTableRow;
  let childStatefulTableRow: StatefulTableRow;
  let parentStatefulTreeTableRow: StatefulTreeTableRow;
  let childStatefulTreeTableRow: StatefulTreeTableRow;
  let grandchildStatefulTreeTableRow: StatefulTreeTableRow;
  let parentStatefulPrefetchedTreeTableRow: StatefulPrefetchedTreeTableRow;
  let childStatefulPrefetchedTreeTableRow: StatefulPrefetchedTreeTableRow;
  let grandchildStatefulPrefetchedTreeTableRow1: StatefulPrefetchedTreeTableRow;
  let grandchildStatefulPrefetchedTreeTableRow2: StatefulPrefetchedTreeTableRow;

  beforeEach(() => {
    parentTableRow = {
      one: 'one-parent',
      two: 'two-parent',
      three: 'three-parent'
    };

    childTableRow = {
      one: 'one-child',
      two: 'two-child',
      three: 'three-child'
    };

    grandchildTableRow = {
      one: 'one-grandchild',
      two: 'two-grandchild',
      three: 'three-grandchild'
    };

    treeTableRow = {
      one: 'one-parent',
      two: 'two-parent',
      three: 'three-parent',
      getChildren: () => of([])
    };

    /**
     * StatefulTableRow
     */

    parentStatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: false,
        selected: false,
        root: true,
        leaf: false,
        depth: 0
      },
      one: 'one-parent',
      two: 'two-parent',
      three: 'three-parent'
    };

    childStatefulTableRow = {
      $$state: {
        parent: parentStatefulTableRow,
        expanded: false,
        selected: false,
        root: false,
        leaf: true,
        depth: 1
      },
      one: 'one-child',
      two: 'two-child',
      three: 'three-child'
    };

    /**
     * StatefulTreeTableRow
     */

    parentStatefulTreeTableRow = {
      $$state: {
        parent: undefined,
        expanded: true,
        selected: false,
        root: true,
        leaf: false,
        depth: 0
      },
      one: 'one-parent',
      two: 'two-parent',
      three: 'three-parent',
      getChildren: () => of([childStatefulTreeTableRow])
    };

    childStatefulTreeTableRow = {
      $$state: {
        parent: parentStatefulTreeTableRow,
        expanded: false,
        selected: false,
        root: false,
        leaf: false,
        depth: 1
      },
      one: 'one-child',
      two: 'two-child',
      three: 'three-child',
      getChildren: () => of([grandchildStatefulTreeTableRow])
    };

    grandchildStatefulTreeTableRow = {
      $$state: {
        parent: childStatefulTreeTableRow,
        expanded: false,
        selected: false,
        root: false,
        leaf: true,
        depth: 2
      },
      one: 'one-grandchild',
      two: 'two-grandchild',
      three: 'three-grandchild',
      getChildren: () => of([])
    };

    /**
     * StatefulPrefetchedTreeTableRow
     */

    parentStatefulPrefetchedTreeTableRow = {
      $$state: {
        children: [],
        expanded: true,
        selected: false,
        root: true,
        leaf: false,
        depth: 0
      },
      one: 'one-parent',
      two: 'two-parent',
      three: 'three-parent',
      getChildren: () => of([childStatefulPrefetchedTreeTableRow])
    };

    childStatefulPrefetchedTreeTableRow = {
      $$state: {
        parent: parentStatefulPrefetchedTreeTableRow,
        children: [],
        expanded: true,
        selected: false,
        root: false,
        leaf: false,
        depth: 1
      },
      one: 'one-child',
      two: 'two-child',
      three: 'three-child',
      getChildren: () => of([grandchildStatefulPrefetchedTreeTableRow1, grandchildStatefulPrefetchedTreeTableRow2])
    };

    parentStatefulPrefetchedTreeTableRow.$$state.children.push(childStatefulPrefetchedTreeTableRow);

    grandchildStatefulPrefetchedTreeTableRow1 = {
      $$state: {
        parent: childStatefulPrefetchedTreeTableRow,
        children: [],
        expanded: false,
        selected: false,
        root: false,
        leaf: true,
        depth: 2
      },
      one: 'one-grandchild1',
      two: 'two-grandchild1',
      three: 'three-grandchild1',
      getChildren: () => of([])
    };

    grandchildStatefulPrefetchedTreeTableRow2 = {
      $$state: {
        parent: childStatefulPrefetchedTreeTableRow,
        children: [],
        expanded: false,
        selected: false,
        root: false,
        leaf: true,
        depth: 2
      },
      one: 'one-grandchild2',
      two: 'two-grandchild2',
      three: 'three-grandchild2',
      getChildren: () => of([])
    };

    childStatefulPrefetchedTreeTableRow.$$state.children.push(grandchildStatefulPrefetchedTreeTableRow1);
    childStatefulPrefetchedTreeTableRow.$$state.children.push(grandchildStatefulPrefetchedTreeTableRow2);
  });

  /****************************
   * State Creation
   ****************************/

  test('should build initial row states for flat rows', () => {
    const rows = [parentTableRow, childTableRow, grandchildTableRow];
    const statefulTableRows = TableCdkRowUtil.buildInitialRowStates(rows);

    expect(statefulTableRows.every(row => !row.$$state.expanded)).toEqual(true);
  });

  test('should build initial row states for prefetched tree rows', () => {
    const parent: StatefulPrefetchedTreeTableRow = TableCdkRowUtil.buildInitialRowStates([
      parentStatefulPrefetchedTreeTableRow
    ])[0] as StatefulPrefetchedTreeTableRow;
    const child: StatefulPrefetchedTreeTableRow = TableCdkRowUtil.buildInitialChildRowStates(
      [childStatefulPrefetchedTreeTableRow],
      parentStatefulPrefetchedTreeTableRow
    )[0] as StatefulPrefetchedTreeTableRow;
    const grandchild1: StatefulPrefetchedTreeTableRow = TableCdkRowUtil.buildInitialChildRowStates(
      [grandchildStatefulPrefetchedTreeTableRow1],
      childStatefulPrefetchedTreeTableRow
    )[0] as StatefulPrefetchedTreeTableRow;
    const grandchild2: StatefulPrefetchedTreeTableRow = TableCdkRowUtil.buildInitialChildRowStates(
      [grandchildStatefulPrefetchedTreeTableRow2],
      childStatefulPrefetchedTreeTableRow
    )[0] as StatefulPrefetchedTreeTableRow;

    /*
     * All of the circular references are causing mayhem, so testing fields individually
     */

    expect(parent.$$state.parent).toBeUndefined();
    expect(parent.$$state.children.length).toEqual(1);
    delete parent.$$state.children;

    expect(parent.$$state).toEqual({
      parent: undefined,
      expanded: false,
      selected: false,
      root: true,
      leaf: false,
      depth: 0
    });

    expect(child.$$state.parent).not.toBeUndefined();
    expect(child.$$state.children.length).toEqual(2);
    delete child.$$state.parent;
    delete child.$$state.children;

    expect(child.$$state).toEqual({
      expanded: false,
      selected: false,
      root: false,
      leaf: false,
      depth: 1
    });

    expect(grandchild1.$$state.parent).not.toBeUndefined();
    expect(grandchild1.$$state.children.length).toEqual(0);
    delete grandchild1.$$state.parent;
    delete grandchild1.$$state.children;

    expect(grandchild1.$$state).toEqual({
      expanded: false,
      selected: false,
      root: false,
      leaf: true,
      depth: 2
    });

    expect(grandchild2.$$state.parent).not.toBeUndefined();
    expect(grandchild2.$$state.children.length).toEqual(0);
    delete grandchild2.$$state.parent;
    delete grandchild2.$$state.children;

    expect(grandchild2.$$state).toEqual({
      expanded: false,
      selected: false,
      root: false,
      leaf: true,
      depth: 2
    });
  });

  /****************************
   * State Changes
   ****************************/

  test('should provide latest row state', () => {
    const cachedRows = [parentStatefulTreeTableRow, childStatefulTreeTableRow, grandchildStatefulTreeTableRow];
    const clonedRow = cloneDeep(childStatefulTreeTableRow);

    const stateChanges = TableCdkRowUtil.buildRowStateChanges(cachedRows, clonedRow);

    expect(TableCdkRowUtil.latestRowChange(stateChanges[0])).toEqual(parentStatefulTreeTableRow);
    expect(TableCdkRowUtil.latestRowChange(stateChanges[1])).toEqual(clonedRow);
    expect(TableCdkRowUtil.latestRowChange(stateChanges[2])).toEqual(grandchildStatefulTreeTableRow);
  });

  test('should build state changes that include any ancestor changes', () => {
    const cachedRows = [parentStatefulTreeTableRow, childStatefulTreeTableRow, grandchildStatefulTreeTableRow];
    const clonedRow = cloneDeep(childStatefulTreeTableRow);

    const stateChanges = TableCdkRowUtil.buildRowStateChanges(cachedRows, clonedRow);

    expect(stateChanges[0].changed).toBeUndefined();
    expect(stateChanges[1].changed).not.toBeUndefined();
    expect(stateChanges[2].changed).not.toBeUndefined();
  });

  /****************************
   * State Actions
   ****************************/

  test('should remove collapsed rows', () => {
    const rows = [parentStatefulTreeTableRow, childStatefulTreeTableRow, grandchildStatefulTreeTableRow];
    expect(TableCdkRowUtil.removeCollapsedRows(rows)).toEqual([parentStatefulTreeTableRow, childStatefulTreeTableRow]);
  });

  test('should collapse all rows', () => {
    const rows = [parentStatefulTreeTableRow, childStatefulTreeTableRow, grandchildStatefulTreeTableRow];
    const changed = cloneDeep(parentStatefulTreeTableRow);
    changed.$$state.expanded = false;
    expect(TableCdkRowUtil.collapseAllRows(rows)).toEqual([changed]);
  });

  test('should expand all rows', () => {
    const collapsed = [parentStatefulPrefetchedTreeTableRow];
    const expanded = cloneDeep([
      parentStatefulPrefetchedTreeTableRow,
      childStatefulPrefetchedTreeTableRow,
      grandchildStatefulPrefetchedTreeTableRow1,
      grandchildStatefulPrefetchedTreeTableRow2
    ]);

    TableCdkRowUtil.expandAllRows(collapsed).forEach((row, index) => {
      expect(TableCdkRowUtil.isEqualExceptState(row, expanded[index]) && row.$$state.expanded).toEqual(true);
    });
  });

  test('should unselect all the rows', () => {
    const row1: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: true,
        selected: true,
        root: true,
        leaf: false,
        depth: 0
      },
      one: '1'
    };

    const row2: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: true,
        selected: true,
        root: true,
        leaf: false,
        depth: 0
      },
      one: '1',
      two: '2',
      three: '3'
    };

    const rows = TableCdkRowUtil.unselectAllRows([row1, row2]);
    rows.forEach(row => expect(row.$$state.selected).toBeFalsy());
  });

  test('should select all the rows', () => {
    const row1: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: true,
        selected: false,
        root: true,
        leaf: false,
        depth: 0
      },
      one: '1'
    };

    const row2: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: true,
        selected: false,
        root: true,
        leaf: false,
        depth: 0
      },
      one: '1',
      two: '2',
      three: '3'
    };

    const rows = TableCdkRowUtil.selectAllRows([row1, row2]);
    rows.forEach(row => expect(row.$$state.selected).toBeTruthy());
  });

  test('should merge row states', () => {
    const row1: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: true,
        selected: true,
        root: true,
        leaf: false,
        depth: 0
      },
      one: '1'
    };

    const row2: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: true,
        selected: true,
        root: true,
        leaf: false,
        depth: 1
      },
      one: '1',
      two: '2',
      three: '3'
    };

    const row3: StatefulTableRow = {
      // tslint:disable-next-line:no-object-literal-type-assertion
      $$state: {
        parent: undefined,
        expanded: false,
        depth: 2
      } as TableRowState,
      one: '1',
      two: '2',
      three: '3'
    };

    const rows = TableCdkRowUtil.mergeRowStates([row1, row2], [row3]);
    expect(rows[0].$$state.depth).toEqual(0);
    expect(rows[1].$$state.depth).toEqual(2);
    expect(rows[1].$$state.expanded).toEqual(false);
    expect(rows[1].$$state.root).toEqual(true);
  });

  /****************************
   * Transforms
   ****************************/

  test('should flatten nested arrays', () => {
    const arrays = [
      [parentStatefulPrefetchedTreeTableRow],
      [childStatefulPrefetchedTreeTableRow],
      grandchildStatefulPrefetchedTreeTableRow1
    ];
    expect(TableCdkRowUtil.flattenNestedRows(arrays)).toEqual([
      parentStatefulPrefetchedTreeTableRow,
      childStatefulPrefetchedTreeTableRow,
      grandchildStatefulPrefetchedTreeTableRow1
    ]);
  });

  /****************************
   * Searches
   ****************************/

  test('should calculate depth', () => {
    expect(TableCdkRowUtil.calcDepth(grandchildStatefulTreeTableRow)).toEqual(2);
  });

  test('should find row', () => {
    const rows = [parentStatefulTreeTableRow, childStatefulTreeTableRow, grandchildStatefulTreeTableRow];
    expect(TableCdkRowUtil.findRow(childStatefulTreeTableRow, rows)).toEqual(childStatefulTreeTableRow);
  });

  /****************************
   * Conditional Checks
   ****************************/

  test('should check for newly expanded row', () => {
    const cachedRows = [parentStatefulTreeTableRow, childStatefulTreeTableRow, grandchildStatefulTreeTableRow];

    const clonedRow = cloneDeep(childStatefulTreeTableRow);
    clonedRow.$$state.expanded = true;

    const stateChanges = TableCdkRowUtil.buildRowStateChanges(cachedRows, clonedRow);

    expect(TableCdkRowUtil.isNewlyExpandedParentRow(stateChanges[0])).toEqual(false);
    expect(TableCdkRowUtil.isNewlyExpandedParentRow(stateChanges[1])).toEqual(true);
    expect(TableCdkRowUtil.isNewlyExpandedParentRow(stateChanges[2])).toEqual(false);
  });

  test('should check for collapsed ancestor', () => {
    expect(TableCdkRowUtil.hasCollapsedAncestor(parentStatefulTreeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.hasCollapsedAncestor(childStatefulTreeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.hasCollapsedAncestor(grandchildStatefulTreeTableRow)).toEqual(true);
    expect(TableCdkRowUtil.hasCollapsedAncestor(parentStatefulPrefetchedTreeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.hasCollapsedAncestor(childStatefulPrefetchedTreeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.hasCollapsedAncestor(grandchildStatefulPrefetchedTreeTableRow1)).toEqual(false);
    expect(TableCdkRowUtil.hasCollapsedAncestor(grandchildStatefulPrefetchedTreeTableRow2)).toEqual(false);
  });

  /****************************
   * Type Checks
   ****************************/

  test('should check if table row is root', () => {
    expect(TableCdkRowUtil.isRoot(parentStatefulTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isRoot(parentStatefulTreeTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isRoot(parentStatefulPrefetchedTreeTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isRoot(childStatefulTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isRoot(childStatefulTreeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isRoot(childStatefulPrefetchedTreeTableRow)).toEqual(false);
  });

  test('should type guard TreeTableRow', () => {
    expect(TableCdkRowUtil.isTreeTableRow(parentTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isTreeTableRow(treeTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isTreeTableRow(childStatefulTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isTreeTableRow(childStatefulTreeTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isTreeTableRow(childStatefulPrefetchedTreeTableRow)).toEqual(true);
  });

  test('should type guard StatefulTableRow', () => {
    expect(TableCdkRowUtil.isStatefulTableRow(parentTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulTableRow(treeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulTableRow(childStatefulTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isStatefulTableRow(childStatefulTreeTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isStatefulTableRow(childStatefulPrefetchedTreeTableRow)).toEqual(true);
  });

  test('should type guard StatefulTreeTableRow', () => {
    expect(TableCdkRowUtil.isStatefulTreeTableRow(parentTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulTreeTableRow(treeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulTreeTableRow(childStatefulTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulTreeTableRow(childStatefulTreeTableRow)).toEqual(true);
    expect(TableCdkRowUtil.isStatefulTreeTableRow(childStatefulPrefetchedTreeTableRow)).toEqual(true);
  });

  test('should type guard PrefetchedTreeTableRow', () => {
    expect(TableCdkRowUtil.isStatefulPrefetchedTreeTableRow(parentTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulPrefetchedTreeTableRow(treeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulPrefetchedTreeTableRow(childStatefulTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulPrefetchedTreeTableRow(childStatefulTreeTableRow)).toEqual(false);
    expect(TableCdkRowUtil.isStatefulPrefetchedTreeTableRow(childStatefulPrefetchedTreeTableRow)).toEqual(true);
  });

  test('should type guard PrefetchedTreeTableRow arrays', () => {
    const rows = [parentStatefulTreeTableRow, childStatefulTreeTableRow, grandchildStatefulTreeTableRow];
    const prefetchedRows = [
      parentStatefulPrefetchedTreeTableRow,
      childStatefulPrefetchedTreeTableRow,
      grandchildStatefulPrefetchedTreeTableRow1,
      grandchildStatefulPrefetchedTreeTableRow2
    ];
    expect(TableCdkRowUtil.isFullyExpandable(rows)).toEqual(false);
    expect(TableCdkRowUtil.isFullyExpandable([...rows, ...prefetchedRows])).toEqual(false);
    expect(TableCdkRowUtil.isFullyExpandable([...prefetchedRows, ...rows])).toEqual(false);
    expect(TableCdkRowUtil.isFullyExpandable(prefetchedRows)).toEqual(true);
  });

  /****************************
   * Equality Check
   ****************************/

  test('should evaluate equality but exclude state', () => {
    const cloned = cloneDeep(childStatefulTableRow);
    cloned.$$state.leaf = !cloned.$$state.leaf;
    expect(TableCdkRowUtil.isEqualExceptState(cloned, childStatefulTableRow)).toEqual(true);

    cloned.one = 'three';
    expect(TableCdkRowUtil.isEqualExceptState(cloned, childStatefulTableRow)).toEqual(false);
  });
});
