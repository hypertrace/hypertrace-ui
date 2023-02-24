import { Observable, Subject } from 'rxjs';
import {
  TopologyConfiguration,
  TopologyDataSpecifier,
  TopologyEdge,
  TopologyEdgeState,
  TopologyElementVisibility,
  TopologyNeighborhood,
  TopologyNode,
  TopologyNodeState
} from '../../../topology';

export class TopologyStateManager {
  private readonly stateChangeSubject: Subject<void> = new Subject();
  public readonly stateChange$: Observable<void> = this.stateChangeSubject.asObservable();
  private readonly currentStateByNode: WeakMap<TopologyNode, TopologyUniqueState<TopologyNodeState>> = new WeakMap();
  private readonly currentStateByEdge: WeakMap<TopologyEdge, TopologyUniqueState<TopologyEdgeState>> = new WeakMap();
  private currentSelectedNodeSpecifier?: TopologyDataSpecifier = this.config.nodeDataSpecifiers[0];
  private currentSelectedEdgeSpecifier?: TopologyDataSpecifier = this.config.edgeDataSpecifiers[0];

  public constructor(private readonly config: TopologyConfiguration) {}

  public getNodeState(node: TopologyNode): TopologyNodeState {
    return {
      ...this.getNodeUniqueState(node),
      selectedDataSpecifier: this.currentSelectedNodeSpecifier && { ...this.currentSelectedNodeSpecifier },
      dataSpecifiers: this.config.nodeDataSpecifiers
    };
  }

  public getEdgeState(edge: TopologyEdge): TopologyEdgeState {
    return {
      ...this.getEdgeUniqueState(edge),
      selectedDataSpecifier: this.currentSelectedEdgeSpecifier && { ...this.currentSelectedEdgeSpecifier },
      dataSpecifiers: this.config.edgeDataSpecifiers
    };
  }

  public updateState(...stateUpdates: TopologyStateUpdate[]): void {
    stateUpdates.forEach(update => this.applyStateUpdate(update));

    this.stateChangeSubject.next();
  }

  public getSelectedNodeDataSpecifier(): TopologyDataSpecifier | undefined {
    return this.currentSelectedNodeSpecifier;
  }

  public setSelectedNodeDataSpecifier(value: TopologyDataSpecifier | undefined): void {
    this.currentSelectedNodeSpecifier = value;
    this.stateChangeSubject.next();
  }

  public getSelectedEdgeDataSpecifier(): TopologyDataSpecifier | undefined {
    return this.currentSelectedEdgeSpecifier;
  }

  public setSelectedEdgeDataSpecifier(value: TopologyDataSpecifier | undefined): void {
    this.currentSelectedEdgeSpecifier = value;
    this.stateChangeSubject.next();
  }

  private buildInitialNodeState(): TopologyUniqueState<TopologyNodeState> {
    return {
      visibility: TopologyElementVisibility.Normal,
      dragging: false
    };
  }

  private buildInitialEdgeState(): TopologyUniqueState<TopologyEdgeState> {
    return {
      visibility: TopologyElementVisibility.Normal
    };
  }

  private getNodeUniqueState(node: TopologyNode): TopologyUniqueState<TopologyNodeState> {
    const state = this.currentStateByNode.get(node) || this.buildInitialNodeState();
    this.currentStateByNode.set(node, state);

    return state;
  }

  private getEdgeUniqueState(edge: TopologyEdge): TopologyUniqueState<TopologyEdgeState> {
    const state = this.currentStateByEdge.get(edge) || this.buildInitialEdgeState();
    this.currentStateByEdge.set(edge, state);

    return state;
  }

  private applyStateUpdate(stateUpdate: TopologyStateUpdate): void {
    if (this.isNeighborhoodUpdate(stateUpdate)) {
      this.applyNodeUpdate(stateUpdate.neighborhood.nodes, stateUpdate.update);
      this.applyEdgeUpdate(stateUpdate.neighborhood.edges, stateUpdate.update);
    }
    if (this.isNodeUpdate(stateUpdate)) {
      this.applyNodeUpdate(stateUpdate.nodes, stateUpdate.update);
    }
    if (this.isEdgeUpdate(stateUpdate)) {
      this.applyEdgeUpdate(stateUpdate.edges, stateUpdate.update);
    }
  }

  private applyNodeUpdate(nodes: TopologyNode[], update: Partial<TopologyUniqueState<TopologyNodeState>>): void {
    nodes.forEach(node => {
      this.currentStateByNode.set(node, { ...this.getNodeUniqueState(node), ...update });
    });
  }

  private applyEdgeUpdate(edges: TopologyEdge[], update: Partial<TopologyUniqueState<TopologyEdgeState>>): void {
    edges.forEach(edge => {
      this.currentStateByEdge.set(edge, { ...this.getEdgeUniqueState(edge), ...update });
    });
  }

  private isNeighborhoodUpdate(
    update: TopologyStateUpdate & Partial<TopologyNeighborhoodUpdate>
  ): update is TopologyNeighborhoodUpdate {
    return update.neighborhood !== undefined;
  }

  private isNodeUpdate(update: TopologyStateUpdate & Partial<TopologyNodeUpdate>): update is TopologyNodeUpdate {
    return update.nodes !== undefined;
  }

  private isEdgeUpdate(update: TopologyStateUpdate & Partial<TopologyEdgeUpdate>): update is TopologyEdgeUpdate {
    return update.edges !== undefined;
  }
}

type TopologyUniqueState<T extends TopologyEdgeState | TopologyNodeState> = Omit<T, 'dataSpecifier'>;

export type TopologyStateUpdate = TopologyNeighborhoodUpdate | TopologyNodeUpdate | TopologyEdgeUpdate;

interface TopologyNeighborhoodUpdate {
  neighborhood: TopologyNeighborhood;
  update: Partial<TopologyUniqueState<TopologyNodeState & TopologyEdgeState>>;
}

interface TopologyNodeUpdate {
  nodes: TopologyNode[];
  update: Partial<TopologyUniqueState<TopologyNodeState>>;
}

interface TopologyEdgeUpdate {
  edges: TopologyEdge[];
  update: Partial<TopologyUniqueState<TopologyEdgeState>>;
}
