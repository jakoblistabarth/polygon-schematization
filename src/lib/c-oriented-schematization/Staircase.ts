import HalfEdge, { OrientationClasses } from "../DCEL/HalfEdge";
import Point from "../geometry/Point";
import Line from "../geometry/Line";
import Polygon from "../geometry/Polygon";
import ConvexHullGrahamScan from "graham_scan";

class Staircase {
  edge: HalfEdge;
  region: Polygon;
  deltaE?: number;
  points: Point[];
  de?: number;
  se?: number;
  interferesWith: HalfEdge[];

  constructor(edge: HalfEdge) {
    this.edge = edge;
    this.deltaE = this.setDeltaE();
    this.points = [];
    this.region = this.getRegion();
    this.interferesWith = [];
  }

  setDeltaE(): number | undefined {
    const length = this.edge.getLength();
    return typeof length === "number" && this.edge.class === OrientationClasses.AD
      ? length * 0.1
      : undefined;
  }

  /**
   * Gets the staircase region of an edge, depending on its class.
   * If the edge has an significant Vertex, it has to be the tail of the edge.
   * If that's not the case its twin is used for calculating the staircase region.
   * @returns The region of an edge.
   */
  getRegion(): Polygon {
    const edge =
      !this.edge.getSignificantVertex() || this.edge.getSignificantVertex() === this.edge.tail
        ? this.edge
        : this.edge.twin;
    const head = edge?.getHead();
    const assignedAngle = edge?.getAssignedAngle();
    if (!edge || !head || typeof assignedAngle !== "number") return new Polygon([]);

    switch (edge.class) {
      case OrientationClasses.AB:
        return new Polygon([
          new Point(edge.tail.x, edge.tail.y),
          new Point(head.x, head.y),
          new Point(head.x, head.y),
          new Point(edge.tail.x, edge.tail.y),
        ]);
      case OrientationClasses.UB:
        return this.getSimpleRegion();
      case OrientationClasses.E:
        return this.getSimpleRegion();
      case OrientationClasses.UD:
        // like UB and E but accommodate for the appendex area
        this.points = this.getStaircasePoints();

        const [lower, upper] = edge.getAssociatedSector()[0].getBounds();
        if (typeof lower !== "number" || typeof upper !== "number") return new Polygon([]);
        const smallestAssociatedAngle = edge.getClosestAssociatedAngle();
        const largestAssociatedAngle = edge
          .getAssociatedAngles()
          .find((angle) => angle != smallestAssociatedAngle);
        if (
          typeof smallestAssociatedAngle !== "number" ||
          typeof largestAssociatedAngle !== "number"
        )
          return new Polygon([]);
        const V = new Point(edge.tail.x, edge.tail.y);
        const a = new Line(V, assignedAngle); // QUESTION: not mentioned in the paper!
        const e = new Line(V, largestAssociatedAngle);
        const W = new Point(head.x, head.y);
        const cAngle = largestAssociatedAngle === upper ? upper : lower; // QUESTION: is there a way to do this more elegantly, without specifying c and d explicitly?
        const dAngle = cAngle === upper ? lower : upper;
        const c = new Line(W, cAngle);
        const d = new Line(W, dAngle);
        const P = this.points[2];
        const b = new Line(P, smallestAssociatedAngle);
        const C = b.intersectsLine(c);
        const B = a.intersectsLine(b);
        const D = e.intersectsLine(d);
        if (!B || !C || !D) return new Polygon([]);
        let regionPoints = [V, B, C, W, D];

        // We assumed that p lies in the defined region.
        // However, if this is not the case, we can extend the staircase region
        // by including the vertices of the appended region;
        if (!P.isInPolygon(new Polygon(regionPoints))) {
          regionPoints.splice(2, 0, P);
        }

        return new Polygon(regionPoints);
      case OrientationClasses.AD:
        this.points = this.getStaircasePoints();
        const convexHull = new ConvexHullGrahamScan();
        this.points.forEach((p) => convexHull.addPoint(p.x, p.y));
        return new Polygon(convexHull.getHull().map((p) => new Point(p.x, p.y)));
      default:
        return new Polygon([]);
    }
  }

  /**
   * Calculates the area of a step, which is a triangle.
   * The area of each step of an edge is either added to or subtracted from its incident faces.
   * @param assignedEdge The length of the assigned step edge.
   * @param associatedEdge The length of the associated step edge.
   * @returns The area of a step.
   */
  getStepArea(assignedEdge: number, associatedEdge: number): number | undefined {
    const enclosingAngle = (Math.PI * 2) / this.edge.dcel.config.c.getDirections().length;
    return (assignedEdge * associatedEdge * Math.sin(enclosingAngle)) / 2;
  }

  getStaircasePoints() {
    switch (this.edge.class) {
      case OrientationClasses.UB:
        return this.getStaircasePointsUB();
      case OrientationClasses.E:
        return this.getStaircasePointsE();
      case OrientationClasses.AD:
        return this.getStaircasePointsAD();
      case OrientationClasses.UD:
        return this.getStaircasePointsUD();
      default:
        return [];
    }
  }

  /**
   * Returns a staircase for an "aligned deviating" edge.
   * @returns All points constructing the staircase (including tail and head of the original edge).
   */
  getStaircasePointsAD(): Point[] {
    const edge = this.edge;
    if (!this.deltaE) return [];
    const epsilon = this.edge.dcel.config.staircaseEpsilon;
    const d1 = edge.getAssignedAngle();
    if (typeof d1 !== "number") return [];
    const d2 = edge.getAngle();
    if (typeof d2 !== "number") return [];
    const d1Opposite = (d1 + Math.PI) % (Math.PI * 2);

    const points: Point[] = [];
    const tail = edge.tail;
    const head = edge.getHead();
    const length = edge.getLength();
    if (typeof length !== "number" || !head) return [];

    points[0] = tail;
    points[1] = tail.getNewPoint(this.deltaE, d1);
    points[2] = points[1].getNewPoint((length * (1 - epsilon)) / 2, d2);
    points[3] = points[2].getNewPoint(this.deltaE * 2, d1Opposite);
    points[4] = points[3].getNewPoint((length * (1 - epsilon)) / 2, d2);
    points[5] = points[4].getNewPoint(this.deltaE, d1);
    points[6] = head;

    return points;
  }

  /**
   * Gets the Points of the staircase region for unaligned basic and evading edges.
   * The region is the area bounded by lines oriented according to the associated directions (both at v and w).
   * @returns a set of Points defining the region
   */
  getSimpleRegion(): Polygon {
    const edge = this.edge;
    const head = edge.getHead();
    if (!head) return new Polygon([]);

    const associatedSector = edge.getAssociatedSector();
    if (!associatedSector) return new Polygon([]);
    const [lower, upper] = associatedSector[0].getBounds();
    const A = new Point(edge.tail.x, edge.tail.y);
    const a = new Line(A, lower);
    const d = new Line(A, upper);
    const C = new Point(head.x, head.y);
    const b = new Line(C, upper);
    const c = new Line(C, lower);
    const B = a.intersectsLine(b);
    const D = d.intersectsLine(c);
    return B && D ? new Polygon([A, B, C, D]) : new Polygon([]);
  }

  /**
   * Returns a staircase for an "unaligned basic" edge.
   * @param se number of steps used to construct the staircase, the minimum number of steps is, the functions default value: 2
   * @returns all points constructing the staircase (including tail and head of the original edge)
   */
  getStaircasePointsUB(): Point[] {
    const se = this.se || 2;
    const edge = this.edge;

    const d1 = edge.getAssignedAngle();
    const associatedAngles = edge.getAssociatedAngles();
    if (typeof d1 !== "number" || !associatedAngles) return [];
    const d2 = associatedAngles.find((angle) => angle !== d1);
    if (typeof d2 !== "number") return [];
    const [l1, l2] = edge.getStepLengths(se, d1);

    const points: Point[] = [edge.tail];
    for (let idx = 0; idx < se; idx++) {
      const o = points[idx * 2];
      if (idx % 2 === 0) {
        const p1 = o.getNewPoint(l1, d1);
        const p2 = p1.getNewPoint(l2, d2);
        points.push(p1, p2);
      } else {
        const p1 = o.getNewPoint(l2, d2);
        const p2 = p1.getNewPoint(l1, d1);
        points.push(p1, p2);
      }
    }

    return points;
  }

  /**
   * Returns a staircase for an "evading" edge.
   * @param se number of steps used to construct the staircase, the minimum number of steps is, the functions default value: 4
   * @returns all points constructing the staircase (including tail and head of the original edge)
   */
  getStaircasePointsE(): Point[] {
    const se = this.se || 4;
    const edge = this.edge;

    const d1 = edge.getAssignedAngle();
    const associatedAngles = edge.getAssociatedAngles();
    if (typeof d1 !== "number" || !associatedAngles) return [];
    const d2 = associatedAngles.find((angle) => angle !== d1);
    if (typeof d2 !== "number") return [];
    const [l1, l2] = edge.getStepLengths(se, d1);

    const points: Point[] = [edge.tail];
    for (let idx = 0; idx < se; idx++) {
      const o = points[idx * 2];
      if (idx < se / 2) {
        const p1 = o.getNewPoint(l1, d1);
        const p2 = p1.getNewPoint(l2, d2);
        points.push(p1, p2);
      } else {
        const p1 = o.getNewPoint(l2, d2);
        const p2 = p1.getNewPoint(l1, d1);
        points.push(p1, p2);
      }
    }

    return points;
  }

  /**
   *
   * @param originalStaircasePoints Points of the original staircase
   * @param l1 length of an assigned step
   * @param l2 length of an associated step
   * @param d1 angle of the assigned step
   * @returns
   */
  getAppendedAreaPoints(
    originalStaircasePoints: Point[],
    l1: number,
    l2: number,
    d1: number
  ): Point[] {
    const stepArea = this.getStepArea(l1, l2);
    const assignedAngle = this.edge.getAssignedAngle();
    if (typeof stepArea !== "number" || typeof assignedAngle !== "number") return [];
    const height = (stepArea * 2) / l2; // get the height of a parallelogram, using A/b = h
    const a = stepArea / height;

    const p1 = originalStaircasePoints[0].getNewPoint(a, assignedAngle);
    const p2 = p1.getNewPoint(l1, d1);

    return [p1, p2];
  }

  /**
   * Returns a staircase for an "unaligned deviating" edge.
   * @param se number of steps used to construct the staircase, the minimum number of steps is, the functions default value: 4
   * @returns all points constructing the staircase (including tail and head of the original edge)
   */
  getStaircasePointsUD(): Point[] {
    const se = this.se || 4;
    const edge = this.edge;

    const d1 = edge.getClosestAssociatedAngle();
    const associatedAngles = edge.getAssociatedAngles();
    if (typeof d1 !== "number" || !associatedAngles) return [];
    const d2 = associatedAngles.find((angle) => angle !== d1);
    if (typeof d2 !== "number") return [];
    const [l1, l2] = edge.getStepLengths(se - 1, d1);

    // like for an evading edge, but 1 associated step less
    const points: Point[] = [edge.tail];
    for (let idx = 0; idx < se - 1; idx++) {
      const o = points[idx * 2];
      if (idx < se / 2 - 1) {
        const p1 = o.getNewPoint(l1, d1);
        const p2 = p1.getNewPoint(l2, d2);
        points.push(p1, p2);
      } else {
        const p1 = o.getNewPoint(l2, d2);
        const p2 = p1.getNewPoint(l1, d1);
        points.push(p1, p2);
      }
    }

    const [p1, p2] = this.getAppendedAreaPoints(points, l1, l2, d1);
    points.splice(1, 0, p1, p2);

    return points;
  }

  /**
   * Sets the edgeDistance of the Staircase, if it is smaller than a possibly already calculated distance.
   * @param edgeDistance Minimum distance between edges.
   * @returns The edge distance.
   */
  setEdgeDistance(edgeDistance: number) {
    if (!this.de || edgeDistance < this.de) this.de = edgeDistance;
    return edgeDistance;
  }
}

export default Staircase;
