export interface Bubble {
  x: number;
  y: number;
  r: number;
}

export interface EasyRect {
  width: number;
  height: number;
}

export interface ScaledLayout {
  rect: EasyRect;
  scaleFactor: number;
}
