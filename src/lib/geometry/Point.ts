import LineSegment from "./LineSegment";
import Polygon from "./Polygon";
import Vector2D from "./Vector2D";

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  xy() {
    return [this.x, this.y];
  }

  toVector(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  distanceToPoint(p: Point) {
    const [x1, y1] = this.xy();
    const [x2, y2] = p.xy();

    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  }

  getNewPoint(distance: number, angle: number): Point {
    // QUESTION: do i really need this conditions for dx, and dy because js' sin/cos implementation is inaccurate??
    const dx = angle === Math.PI * 0.5 || angle === Math.PI * 1.5 ? 0 : Math.cos(angle);
    const dy = angle === Math.PI * 1 || angle === Math.PI * 2 ? 0 : Math.sin(angle);
    return new Point(this.x + distance * dx, this.y + distance * dy);
  }

  isOnLineSegment(lineSegment: LineSegment) {
    const PA = this.distanceToPoint(lineSegment.endPoint1);
    const PB = this.distanceToPoint(lineSegment.endPoint2);
    return parseFloat((PA + PB).toFixed(10)) === parseFloat(lineSegment.getLength().toFixed(10));
  }

  /**
   * Checks whether the {@link Point} lies within the specified polygon.
   * This algorithm works only(!) on convex polygons.
   * This poses no problem as all {@link staircase} regions are by definition convex polygons.
   * as seen @ [algorithmtutor.com](https://algorithmtutor.com/Computational-Geometry/Check-if-a-point-is-inside-a-polygon/)
   * @param polygon An array of Points.
   * @returns A boolean indicating, whether the Point is within the specified polygon.
   */
  isInPolygon(polygon: Polygon) {
    const A: number[] = [];
    const B: number[] = [];
    const C: number[] = [];

    polygon.points.forEach((p, idx) => {
      const p1 = p;
      const p2 = polygon.points[(idx + 1) % polygon.points.length];

      // calculate A, B and C
      const a = -(p2.y - p1.y);
      const b = p2.x - p1.x;
      const c = -(a * p1.x + b * p1.y).toFixed(10);

      A.push(a);
      B.push(b);
      C.push(c);
    });

    const D = A.map((elem, idx) => +(elem * this.x + B[idx] * this.y + C[idx]).toFixed(10));

    const t1 = D.every((d) => d >= 0);
    const t2 = D.every((d) => d <= 0);

    return t1 || t2;
  }

  equals(point: Point): boolean {
    return (
      Number((this.x - point.x).toFixed(10)) === 0 && Number((this.y - point.y).toFixed(10)) === 0
    );
  }
}

export default Point;
