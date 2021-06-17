import Dcel from "../assets/lib/Dcel/Dcel";
import C from "../assets/lib/OrientationRestriction/C";
import { EdgeClasses } from "../assets/lib/Dcel/HalfEdge";
import Vertex from "../assets/lib/Dcel/Vertex";
import Staircase from "../assets/lib/OrientationRestriction/Staircase";
import Point from "../assets/lib/Geometry/Point";
import config from "../assets/schematization.config";

describe("The Staircase class", function () {
  it("returns a Staircase region for an unaligned basic halfEdge", function () {
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

  it("returns a Staircase region for an unaligned basic halfEdge", function () {
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

  it("returns a Staircase region for an unaligned basic halfEdge", function () {
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

describe("buildStaircaseAD", function () {
  it("returns a Staircase for an unaligned deviating halfEdge with 7 Vertices", function () {
    const dcel = new Dcel();
    dcel.config = { ...config, c: new C(4) };

    const o = new Vertex(0, 0, dcel);
    const d = new Vertex(10, 10, dcel);
    const edge = dcel.makeHalfEdge(o, d);
    const twin = dcel.makeHalfEdge(d, o);
    edge.twin = twin;
    twin.twin = edge;
    edge.class = EdgeClasses.AD;
    edge.assignedAngle = 0;
    edge.dcel = dcel;

    const staircase = new Staircase(edge);
    expect(staircase.points.length).toBe(7);
    expect(staircase.region.length).toBeLessThanOrEqual(staircase.points.length);
  });
});