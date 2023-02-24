import {
  distanceBetweenPoints,
  getAngleForCoordinate,
  getCoordinateAtAngle,
  getPercentage,
  getVectorAngleRad,
  isAngleBetweenRadians,
  normalizeAngleRadians
} from './math-utilities';

describe('getVectorAngleRad', () => {
  it('should return correct values for simple points', () => {
    const origin = { x: 0, y: 0 };
    expect(getVectorAngleRad(origin, { x: 1, y: 0 })).toBeCloseTo(0);
    expect(getVectorAngleRad(origin, { x: 1, y: -1 })).toBeCloseTo(Math.PI / 4);
    expect(getVectorAngleRad(origin, { x: 0, y: -1 })).toBeCloseTo(Math.PI / 2);
    expect(getVectorAngleRad(origin, { x: -1, y: -1 })).toBeCloseTo((3 * Math.PI) / 4);
    expect(getVectorAngleRad(origin, { x: -1, y: 0 })).toBeCloseTo(Math.PI);
    expect(getVectorAngleRad(origin, { x: -1, y: 1 })).toBeCloseTo((5 * Math.PI) / 4);
    expect(getVectorAngleRad(origin, { x: 0, y: 1 })).toBeCloseTo((3 * Math.PI) / 2);
    expect(getVectorAngleRad(origin, { x: 1, y: 1 })).toBeCloseTo((7 * Math.PI) / 4);

    expect(getVectorAngleRad(origin, { x: 0, y: 0 })).toBeCloseTo(0);
  });

  it('should work with a shifted origin', () => {
    expect(getVectorAngleRad({ x: 1, y: 1 }, { x: 2, y: 0 })).toBeCloseTo(Math.PI / 4);
  });

  it('should flip angle if points are flipped', () => {
    expect(getVectorAngleRad({ x: 2, y: 0 }, { x: 1, y: 1 })).toBeCloseTo((5 * Math.PI) / 4);
  });
});

describe('normalizeAngleRadians', () => {
  it('works for zero', () => {
    expect(normalizeAngleRadians(0)).toBeCloseTo(0);
    expect(normalizeAngleRadians(2 * Math.PI)).toBeCloseTo(0);
    expect(normalizeAngleRadians(-2 * Math.PI)).toBeCloseTo(0);
  });

  it('works for positive angles', () => {
    expect(normalizeAngleRadians(Math.PI / 2)).toBeCloseTo(Math.PI / 2);

    expect(normalizeAngleRadians((5 * Math.PI) / 2)).toBeCloseTo(Math.PI / 2);

    expect(normalizeAngleRadians((7 * Math.PI) / 2)).toBeCloseTo((3 * Math.PI) / 2);
  });

  it('works for negative angles', () => {
    expect(normalizeAngleRadians(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2);

    expect(normalizeAngleRadians((-5 * Math.PI) / 2)).toBeCloseTo((3 * Math.PI) / 2);

    expect(normalizeAngleRadians((-7 * Math.PI) / 2)).toBeCloseTo(Math.PI / 2);
  });
});

describe('isAngleBetweenRadians', () => {
  it('works for basic cases', () => {
    expect(isAngleBetweenRadians(1, 0, 2)).toBe(true);
    expect(isAngleBetweenRadians(0, 1, 2)).toBe(false);
  });

  it('works even when start is greater than end', () => {
    expect(isAngleBetweenRadians(1, 2, 0)).toBe(true);
    expect(isAngleBetweenRadians(0, 2, 1)).toBe(false);
  });

  it('is exclusive on boundaries', () => {
    expect(isAngleBetweenRadians(0, 0, 2)).toBe(false);

    expect(isAngleBetweenRadians(2, 0, 2)).toBe(false);
  });

  it('works for non normalized values', () => {
    expect(isAngleBetweenRadians(-1.5, -1, -2)).toBe(true);
    expect(isAngleBetweenRadians(8, 0, 2)).toBe(true);
  });
});

describe('getCoordinateAtAngle', () => {
  it('works for basic cases', () => {
    expect(getCoordinateAtAngle(10, 0)).toEqual({ x: 0, y: -10 });
    expect(getCoordinateAtAngle(10, Math.PI / 2)).toEqual({ x: 10, y: -6.123233995736766e-16 });
    expect(getCoordinateAtAngle(10, Math.PI)).toEqual({ x: 1.2246467991473533e-15, y: 10 });
    expect(getCoordinateAtAngle(10, (3 * Math.PI) / 2)).toEqual({ x: -10, y: 1.8369701987210296e-15 });
    expect(getCoordinateAtAngle(10, 2 * Math.PI)).toEqual({ x: -2.4492935982947065e-15, y: -10 });
  });
});

describe('getAngleForCoordinate', () => {
  it('works for basic cases', () => {
    expect(getAngleForCoordinate(0, 1)).toEqual(0);
    expect(getAngleForCoordinate(1, 1).toPrecision(2)).toEqual((Math.PI / 4).toPrecision(2));
    expect(getAngleForCoordinate(1, 0).toPrecision(2)).toEqual((Math.PI / 2).toPrecision(2));
    expect(getAngleForCoordinate(1, -1).toPrecision(2)).toEqual(((3 * Math.PI) / 4).toPrecision(2));
    expect(getAngleForCoordinate(0, -1).toPrecision(2)).toEqual(Math.PI.toPrecision(2));
    expect(getAngleForCoordinate(-1, -1).toPrecision(2)).toEqual(((5 * Math.PI) / 4).toPrecision(2));
    expect(getAngleForCoordinate(-1, 0).toPrecision(2)).toEqual(((3 * Math.PI) / 2).toPrecision(2));
    expect(getAngleForCoordinate(-1, 1).toPrecision(2)).toEqual(((7 * Math.PI) / 4).toPrecision(2));
  });
});

describe('distanceBetweenPoints', () => {
  it('works for positive values', () => {
    expect(distanceBetweenPoints({ x: 0, y: 0 }, { x: 2, y: 2 })).toBe(2 * Math.SQRT2);
    expect(distanceBetweenPoints({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(2);
  });

  it('works for negative values', () => {
    expect(distanceBetweenPoints({ x: 1, y: 1 }, { x: -1, y: -1 })).toBe(2 * Math.SQRT2);
    expect(distanceBetweenPoints({ x: -2, y: -2 }, { x: -3, y: -2 })).toBe(1);
  });
});

describe('getPercentage', () => {
  it('works for valid numbers', () => {
    expect(getPercentage(10, 100)).toEqual(10);
  });

  it('works for undefined values', () => {
    expect(getPercentage(1, undefined)).toEqual(0);
    expect(getPercentage(undefined, 1)).toEqual(0);
    expect(getPercentage(undefined, undefined)).toEqual(0);
  });

  it('works when denominator is 0', () => {
    expect(getPercentage(1, 0)).toEqual(0);
  });
});
