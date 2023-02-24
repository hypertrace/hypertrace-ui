import { isEqualIgnoreFunctions } from '@hypertrace/common';
import { omit } from 'lodash-es';
import {
  RowStateChange,
  StatefulPrefetchedTreeTableRow,
  StatefulTableRow,
  StatefulTreeTableRow,
  TableRow,
  TableRowState,
  TreeTableRow
} from '../table-api';

// tslint:disable-next-line:no-namespace
export namespace TableCdkRowUtil {
  /****************************
   * State Creation
   ****************************/

  export const buildInitialRowStates = (rows: TableRow[]): StatefulTableRow[] =>
    rows.map(row => ({
      ...row,
      $$state: buildInitialRowState(row)
    }));

  export const buildInitialChildRowStates = (
    children: TreeTableRow[],
    parent: StatefulTreeTableRow
  ): StatefulTreeTableRow[] => children.map(child => buildInitialChildRowState(child, parent));

  const buildInitialChildRowState = (child: TreeTableRow, parent: StatefulTreeTableRow): StatefulTreeTableRow => ({
    ...child,
    $$state: buildInitialRowState(child, parent)
  });

  const buildInitialRowState = (row: TableRow, parent?: StatefulTableRow): TableRowState => ({
    parent: parent,
    expanded: false,
    selected: false,
    root: !parent,
    children: isStatefulPrefetchedTreeTableRow(row) ? row.$$state.children : undefined,
    leaf: isStatefulPrefetchedTreeTableRow(row) ? row.$$state.children.length === 0 : !!parent,
    depth: !parent ? 0 : calcDepth(parent, 1)
  });

  export const cloneRow = (row: StatefulTableRow): StatefulTableRow => ({
    ...row,
    $$state: { ...row.$$state }
  });

  /****************************
   * State Changes
   ****************************/

  export const latestRowChange = (rowStateChange: RowStateChange): StatefulTableRow =>
    rowStateChange.changed || rowStateChange.cached;

  export const buildRowStateChanges = (
    cachedRows: StatefulTableRow[],
    changedRow: StatefulTableRow | undefined
  ): RowStateChange[] =>
    /*
     * We need a way to determine if a row or its ancestors state has changed since last it was cached. Ancestor
     * state changes can affect all descendents so those need to be determined as well. For instance, if we are
     * in the waterfall and a grandparent row is collapsed, that should signal to all children and grandchildren
     * that they should no longer be visible.
     *
     * To build the RowStateChange we first assign the unaltered cached row to "previous". The "changed" property is
     * then populated with the new row if its state has changed, or the closest ancestor if one of their states has
     * changed. The "changed" property is left undefined if no state changes are detected for this row or any of its
     * ancestors.
     */
    cachedRows.map(cachedRow => ({
      cached: cachedRow,
      changed: buildChangedState(cachedRow, changedRow)
    }));

  const buildChangedState = (
    cachedRow: StatefulTableRow,
    changedRow: StatefulTableRow | undefined
  ): StatefulTableRow | undefined => {
    /*
     * We need to check for changes not only in the current row, but also for any changes in the ancestors. So, we
     * return a row if it _or_ one of the ancestors changed.
     */

    if (!isRowOrAncestorChange(cachedRow, changedRow)) {
      return undefined;
    }

    return buildChanged(cachedRow, changedRow);
  };

  export const buildChanged = (
    cachedRow: StatefulTableRow,
    changedRow: StatefulTableRow | undefined
  ): StatefulTableRow => {
    const row =
      changedRow === undefined ? cachedRow : isEqualExceptState(cachedRow, changedRow) ? changedRow : cachedRow;

    // If cached row doesn't have a parent, that means the changedRow is the cachedRow
    if (cachedRow.$$state.parent === undefined) {
      return row;
    }

    // If the cached row does have a parent, the changedRow might be an ancestor
    row.$$state.parent = buildChanged(cachedRow.$$state.parent, changedRow);

    return row;
  };

  const isRowOrAncestorChange = (
    row: StatefulTableRow | undefined,
    changedRow: StatefulTableRow | undefined
  ): boolean => {
    if (row === undefined || changedRow === undefined) {
      return false;
    }

    // If row is not the changed row, look up the ancestry tree for changes
    return isEqualExceptState(row, changedRow) ? true : isRowOrAncestorChange(row.$$state.parent, changedRow);
  };

  /****************************
   * State Actions
   ****************************/

  export const removeCollapsedRows = (rows: StatefulTableRow[]): StatefulTableRow[] =>
    rows.filter(row => !hasCollapsedAncestor(row));

  export const collapseAllRows = (rows: StatefulTableRow[]): StatefulTableRow[] =>
    rows.filter(isRoot).map(row => {
      row.$$state.expanded = false;

      return row;
    });

  export const expandAllRows = (rows: StatefulPrefetchedTreeTableRow[]): StatefulPrefetchedTreeTableRow[] =>
    (collapseAllRows(rows) as StatefulPrefetchedTreeTableRow[]).flatMap(expandChildrenRows);

  const expandChildrenRows = (row: StatefulPrefetchedTreeTableRow): StatefulPrefetchedTreeTableRow[] => {
    row.$$state.expanded = true;

    if (!isStatefulPrefetchedTreeTableRow(row)) {
      return [row];
    }

    const children = row.$$state.children.flatMap(child =>
      expandChildrenRows(buildInitialChildRowState(child, row) as StatefulPrefetchedTreeTableRow)
    );

    return [row, ...children];
  };

  export const unselectAllRows = (rows: StatefulTableRow[]): StatefulTableRow[] =>
    rows.map(row => {
      row.$$state.selected = false;

      return row;
    });

  export const selectAllRows = (rows: StatefulTableRow[]): StatefulTableRow[] =>
    rows.map(row => {
      row.$$state.selected = true;

      return row;
    });

  export const mergeRowStates = (to: StatefulTableRow[], from: StatefulTableRow[]): StatefulTableRow[] =>
    to.map(toRow => {
      const found = from.find(fromRow => isEqualExceptState(toRow, fromRow));

      if (found) {
        toRow.$$state = {
          ...toRow.$$state,
          ...found.$$state
        };
      }

      return toRow;
    });

  /****************************
   * Transforms
   ****************************/

  export const flattenNestedRows = (rows: (StatefulTableRow | StatefulTableRow[])[]): StatefulTableRow[] =>
    rows.flatMap(row => (Array.isArray(row) ? row.flatMap(inner => inner) : row));

  /****************************
   * Searches
   ****************************/

  export const calcDepth = (row: StatefulTableRow, depth = 0): number =>
    row.$$state.parent === undefined ? depth : calcDepth(row.$$state.parent, depth + 1);

  export const findRow = (matchRow: StatefulTableRow, searchRows: StatefulTableRow[]): StatefulTableRow | undefined =>
    searchRows.find(searchRow => isEqualExceptState(matchRow, searchRow));

  /****************************
   * Conditional Checks
   ****************************/

  export const isNewlyExpandedParentRow = (stateChange: RowStateChange): boolean =>
    stateChange.changed === undefined
      ? false
      : !stateChange.cached.$$state.expanded && stateChange.changed.$$state.expanded;

  export const hasCollapsedAncestor = (row: StatefulTableRow): boolean =>
    row.$$state.parent === undefined
      ? false
      : !row.$$state.parent.$$state.expanded || hasCollapsedAncestor(row.$$state.parent);

  /****************************
   * Type Checks
   ****************************/

  export const isRoot = (row: StatefulTableRow): boolean => !row.$$state.parent;

  export const isTreeTableRow = (row: TableRow): row is TreeTableRow => typeof row.getChildren === 'function';

  export const isStatefulTableRow = (row: TableRow): row is StatefulTableRow => row.hasOwnProperty('$$state');

  export const isStatefulTreeTableRow = (row: TableRow): row is StatefulTreeTableRow =>
    isStatefulTableRow(row) && isTreeTableRow(row);

  export const isStatefulPrefetchedTreeTableRow = (row: TableRow): row is StatefulPrefetchedTreeTableRow =>
    isTreeTableRow(row) && isStatefulTableRow(row) && row.$$state.hasOwnProperty('children');

  export const isFullyExpandable = (rows: StatefulTableRow[]): rows is StatefulPrefetchedTreeTableRow[] =>
    rows.every(isStatefulPrefetchedTreeTableRow);

  /****************************
   * Equality Check
   ****************************/

  export const isEqualExceptState = (first: TableRow, second: TableRow): boolean =>
    isEqualIgnoreFunctions(omit(first, '$$state'), omit(second, '$$state'));
}
