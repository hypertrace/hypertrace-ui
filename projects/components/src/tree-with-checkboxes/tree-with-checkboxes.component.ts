import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, TemplateRef } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { isNumber } from 'lodash-es';
import { ButtonStyle } from '../button/button';
import { TreeItemFlatNode, TreeItemNode } from './tree-node-types';

@Component({
  selector: 'ht-tree-with-checkboxes',
  styleUrls: ['./tree-with-checkboxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-tree [dataSource]="this.dataSource" [treeControl]="this.treeControl">
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle matTreeNodePadding>
        <ht-checkbox
          *ngIf="this.checkboxes; else elseBlock"
          class="checklist-leaf-node"
          [checked]="this.checklistSelection.isSelected(node)"
          (checkedChange)="this.todoLeafItemSelectionToggle(node)"
          [label]="node.item"
        ></ht-checkbox>

        <ng-template #elseBlock>
          <ng-container
            *ngTemplateOutlet="
              this.isItemAString(node.item) ? defaultItem : node.item;
              context: { $implicit: node.item }
            "
          ></ng-container>
        </ng-template>
      </mat-tree-node>

      <mat-tree-node *matTreeNodeDef="let node; when: this.hasChild" matTreeNodePadding>
        <ht-button
          matTreeNodeToggle
          [icon]="this.treeControl.isExpanded(node) ? '${IconType.ChevronDown}' : '${IconType.ChevronRight}'"
          [display]="'${ButtonStyle.PlainText}'"
        >
        </ht-button>
        <ht-checkbox
          *ngIf="this.checkboxes; else elseBlock"
          [checked]="this.descendantsAllSelected(node)"
          [indeterminate]="this.descendantsPartiallySelected(node)"
          (checkedChange)="this.todoItemSelectionToggle(node)"
          [label]="node.item"
        ></ht-checkbox>

        <ng-template #elseBlock>
          <ng-container
            *ngTemplateOutlet="
              this.isItemAString(node.item) ? defaultItem : node.item;
              context: { $implicit: node.item }
            "
          ></ng-container>
        </ng-template>
      </mat-tree-node>
    </mat-tree>
    <ng-template #defaultItem let-item><ht-label [label]="item"></ht-label></ng-template>
  `
})
export class TreeWithCheckboxesComponent implements OnChanges {
  @Input()
  public data: TreeItemNode[] = [];

  @Input()
  public checkboxes: boolean = false;

  @Output()
  public readonly selectionToggle: EventEmitter<{ label: string; parent: string | undefined }[]> = new EventEmitter();

  public dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;

  public treeControl: FlatTreeControl<TreeItemFlatNode>;

  /** The selection for checklist */
  public checklistSelection: SelectionModel<TreeItemFlatNode> = new SelectionModel<TreeItemFlatNode>(
    true /* multiple */
  );

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  private readonly flatNodeMap: Map<TreeItemFlatNode, TreeItemNode> = new Map<TreeItemFlatNode, TreeItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  private readonly nestedNodeMap: Map<TreeItemNode, TreeItemFlatNode> = new Map<TreeItemNode, TreeItemFlatNode>();

  private readonly treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;

  public constructor() {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data) {
      this.dataSource.data = this.data;
    }
  }

  /** Whether all the descendants of the node are selected. */
  public descendantsAllSelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);

    const descAllSelected =
      descendants.length > 0 && descendants.every(child => this.checklistSelection.isSelected(child));

    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  public descendantsPartiallySelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));

    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  public todoItemSelectionToggle(node: TreeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);

    this.selectionToggle.emit(
      this.checklistSelection.selected.map(selection => ({
        label: selection.label,
        parent: this.getParentNode(selection)?.label
      }))
    );
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  public todoLeafItemSelectionToggle(node: TreeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
    this.selectionToggle.emit(
      this.checklistSelection.selected.map(selection => ({
        label: selection.label,
        parent: this.getParentNode(selection)?.label
      }))
    );
  }

  public isItemAString(item: string | TemplateRef<unknown>): boolean {
    return typeof item === 'string';
  }

  public hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

  private readonly getLevel = (node: TreeItemFlatNode) => node.level;

  private readonly isExpandable = (node: TreeItemFlatNode) => node.expandable;

  private readonly getChildren = (node: TreeItemNode): TreeItemNode[] => node.children ?? [];

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  private readonly transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : {
            label: node.label,
            item: node.item,
            level: level,
            expandable: isNumber(node.children?.length) ? true : false
          };
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    return flatNode;
  };

  /* Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(node: TreeItemFlatNode): void {
    let parent: TreeItemFlatNode | undefined = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  private checkRootNodeSelection(node: TreeItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 && descendants.every(child => this.checklistSelection.isSelected(child));
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  private getParentNode(node: TreeItemFlatNode): TreeItemFlatNode | undefined {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return undefined;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }

    return undefined;
  }
}
