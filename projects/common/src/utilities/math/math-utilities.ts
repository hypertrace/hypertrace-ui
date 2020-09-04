/**
 * Returns the angle between [0, 2π], between the vector formed from origin to point and the x axis.
 */
export const getVectorAngleRad = (origin: Point, point: Point): number => {
  const dx = point.x - origin.x;
  const dy = origin.y - point.y; // UI coordinates invert y axis

  return normalizeAngleRadians(Math.atan2(dy, dx));
};

/**
 * Returns the provided angle in radians to a normalized range between [0,2π)
 *
 */
export const normalizeAngleRadians = (angleRadians: number): number => {
  const TWO_PI = 2 * Math.PI;

  return angleRadians >= 0 ? angleRadians % TWO_PI : ((angleRadians % TWO_PI) + TWO_PI) % TWO_PI;
};

/**
 * Returns the co-ordinate of a point which is at an angle and distance from the reference point.
 *
 * @param angle A constant angle value in radians, with 0 at -y (12 o’clock).
 */
export const getCoordinateAtAngle = (distance: number, angle: number): Point => ({
  x: getXCoordinateAtAngle(distance, angle),
  y: getYCoordinateAtAngle(distance, angle)
});

/**
 * Returns the co-ordinate of a point which is at an angle and distance from the reference point.
 *
 * @param angle A constant angle value in radians, with 0 at 12 o’clock in clockwise direction.
 */
export const getXCoordinateAtAngle = (distance: number, angle: number): number => distance * Math.sin(angle);

/**
 * Returns the co-ordinate of a point which is at an angle and distance from the reference point.
 *
 * @param angle A constant angle value in radians, with 0 at 12 o’clock in clockwise direction.
 */
export const getYCoordinateAtAngle = (distance: number, angle: number): number => distance * -Math.cos(angle);

/**
 * Returns the angle in clockwise direction. A constant angle value in radians, with 0 at 12 o’clock.
 *
 * @param x co-ordinate of a point which is at an angle and distance from the reference point.
 * @param y co-ordinate of a point which is at an angle and distance from the reference point.
 */
export const getAngleForCoordinate = (x: number, y: number): number => {
  const twoPI = 2 * Math.PI;

  const counterClockWiseAngleWithXAxis = (Math.atan2(y, x) + twoPI) % twoPI;
  const clockwiseAngleWithXAxis = twoPI - counterClockWiseAngleWithXAxis;
  const clockwiseAngleWithYAxis = (clockwiseAngleWithXAxis + Math.PI / 2) % twoPI;

  return clockwiseAngleWithYAxis;
};

/**
 * Returns true if angle is between start and end, exclusive.
 */
export const isAngleBetweenRadians = (angle: number, start: number, end: number): boolean => {
  const angleNormalized = normalizeAngleRadians(angle);
  const startNormalized = normalizeAngleRadians(start);
  const endNormalized = normalizeAngleRadians(end);

  // Swap start and end if needed
  const lowerBound = Math.min(startNormalized, endNormalized);
  const upperBound = Math.max(startNormalized, endNormalized);

  return angleNormalized > lowerBound && angleNormalized < upperBound;
};

export const distanceBetweenPoints = (point1: Point, point2: Point): number =>
  Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));

export const intersectionBetweenLines = (line1: Line, line2: Line): Point | undefined => {
  // Line 1 represented as a1x + b1y = c1
  const a1 = line1.b.y - line1.a.y;
  const b1 = line1.a.x - line1.b.x;
  const c1 = a1 * line1.a.x + b1 * line1.a.y;

  // Line 2 represented as a2x + b2y = c2
  const a2 = line2.b.y - line2.a.y;
  const b2 = line2.a.x - line2.b.x;
  const c2 = a2 * line2.a.x + b2 * line2.a.y;

  const determinant = a1 * b2 - a2 * b1;

  return determinant === 0
    ? undefined
    : {
        x: (b2 * c1 - b1 * c2) / determinant,
        y: (a1 * c2 - a2 * c1) / determinant
      };
};

export const lineFromPoints = (point1: Point, point2: Point): Line => ({
  a: point1,
  b: point2
});

export const getPercentage = (numerator: number | undefined, denominator: number | undefined): number => {
  if (numerator === undefined || denominator === undefined || denominator === 0) {
    return 0;
  }

  return (numerator / denominator) * 100;
};

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  a: Point;
  b: Point;
}
