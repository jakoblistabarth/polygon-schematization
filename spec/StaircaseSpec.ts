import Dcel from "../assets/lib/Dcel/Dcel";
import C from "../assets/lib/OrientationRestriction/C";
import { EdgeClasses } from "../assets/lib/Dcel/HalfEdge";
import Vertex from "../assets/lib/Dcel/Vertex";
import Staircase from "../assets/lib/OrientationRestriction/Staircase";
import Point from "../assets/lib/Geometry/Point";
import config from "../assets/schematization.config";

describe("The staircase class", function () {
  it("returns a staircase region for a HalfEdge of class UB", function () {
    const dcel = new Dcel();
    dcel.config = config;

    const o = new Vertex(0, 0, dcel);
    const d = new Vertex(2, 2, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.UB;

    const staircase = new Staircase(edge);
    expect(staircase.region).toEqual([
      new Point(0, 0),
      new Point(2, 0),
      new Point(2, 2),
      new Point(0, 2),
    ]);
  });

  it("returns a staircase region for a HalfEdge of class UB", function () {
    const dcel = new Dcel();
    dcel.config = config;

    const o = new Vertex(0, 0, dcel);
    const d = new Vertex(-2, -2, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.UB;

    const staircase = new Staircase(edge);

    expect(staircase.region).toEqual([
      new Point(0, 0),
      new Point(-2, 0),
      new Point(-2, -2),
      new Point(0, -2),
    ]);
  });

  it("returns a staircase region for a HalfEdge of class UB", function () {
    const dcel = new Dcel();
    dcel.config = config;

    const o = new Vertex(0, 0, dcel);
    const d = new Vertex(-10, 2, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.UB;

    const staircase = new Staircase(edge);
    expect(staircase.region).toEqual([
      new Point(0, 0),
      new Point(0, 2),
      new Point(-10, 2),
      new Point(-10, 0),
    ]);
  });
});

describe("Build staircase for a HalfEdge of class AD", function () {
  it("returns a staircase containing 7 Points", function () {
    const dcel = new Dcel();
    dcel.config = { ...config, c: new C(4) };

    const o = new Vertex(0, 0, dcel);
    const d = new Vertex(10, 10, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.AD;
    edge.assignedDirection = 0;
    edge.dcel = dcel;

    const staircase = new Staircase(edge);
    expect(staircase.points.length).toBe(7);
    expect(staircase.region.length).toBeLessThanOrEqual(staircase.points.length);
  });
});

// TODO: test staircase with head like for staircase of UD edges
describe("Build staircase for a HalfEdge of class UB", function () {
  it("returns a staircase containing a minimum of 5 Points", function () {
    const dcel = new Dcel();
    dcel.config = { ...config, c: new C(2) };

    const o = new Vertex(1, 1, dcel);
    const d = new Vertex(7, 5, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.UB;
    edge.assignedDirection = 0;
    edge.dcel = dcel;

    const staircase = new Staircase(edge);
    const points = staircase.getStairCasePointsUB();
    expect(points.length).toBeGreaterThanOrEqual(5);
  });
});

describe("Build staircase for a HalfEdge of class UD", function () {
  it("returns a staircase with a minimum of 9 points", function () {
    const dcel = new Dcel();
    dcel.config = { ...config, c: new C(2) };

    const o = new Vertex(0, 0, dcel);
    const d = new Vertex(7, 5, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.UD;
    edge.assignedDirection = 3;
    edge.dcel = dcel;

    const staircase = new Staircase(edge);
    const points = staircase.getStairCasePointsUD();
    const d2 = points[points.length - 1];

    expect(points.length).toBeGreaterThanOrEqual(9);
    expect([d.x, d.y]).toEqual([d2.x, d2.y]);
  });

  it("returns a staircase with a minimum of 9 points", function () {
    const dcel = new Dcel();
    dcel.config = { ...config, c: new C(2) };

    const o = new Vertex(0, 0, dcel);
    const d = new Vertex(-7, -5, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.UD;
    edge.assignedDirection = 0;
    edge.dcel = dcel;

    const staircase = new Staircase(edge);
    const points = staircase.getStairCasePointsUD();
    const d2 = points[points.length - 1];

    expect(points.length).toBeGreaterThanOrEqual(9);
    expect(d.x).toBeCloseTo(d2.x, 10);
    expect(d.y).toBeCloseTo(d2.y, 10);
  });
});
