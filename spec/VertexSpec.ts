import fs from "fs";
import path from "path";
import Vertex from "../src/lib/dcel/Vertex";
import HalfEdge from "../src/lib/dcel/Halfedge";
import Dcel from "../src/lib/dcel/Dcel";
import { getTestFiles } from "./test-setup";

describe("distanceToVertex()", function () {
  it("returns the correct distance between 2 vertices", function () {
    const a = new Vertex(0, 0, null);
    const b = new Vertex(4, 0, null);
    const c = new Vertex(4, 4, null);
    const d = new Vertex(-4, -4, null);

    expect(b.distanceToVertex(a)).toEqual(b.distanceToVertex(a));
    expect(a.distanceToVertex(b)).toEqual(4);
    expect(a.distanceToVertex(c)).toEqual(Math.sqrt(4 * 4 + 4 * 4));
    expect(d.distanceToVertex(a)).toEqual(Math.sqrt(-4 * -4 + -4 * -4));
  });
});

describe("distanceToEdge()", function () {
  it("returns the minimum distance between a vertex and an edge", function () {
    const a = new Vertex(0, 0, null);
    const v = new Vertex(-1, -2, null);
    const w = new Vertex(2, 1, null);

    const edge = new HalfEdge(v, null);
    edge.twin = new HalfEdge(w, null);
    edge.twin.twin = edge;

    expect(a.distanceToEdge(edge)).toEqual(Math.sqrt(0.5));
    expect(v.distanceToEdge(edge)).toEqual(0);
  });
});

describe("sortEdges()", function () {
  // TODO: use before each to test more cases based on the same 4 edges

  it("sorts 4 radial edges in clockwise order", function () {
    const center = new Vertex(0, 0, null);

    const headRight = new Vertex(4, 0, null);
    const edgeRight = new HalfEdge(center, null);
    edgeRight.twin = new HalfEdge(headRight, null);
    edgeRight.twin.twin = edgeRight;

    const headBottom = new Vertex(0, -1, null);
    const edgeBottom = new HalfEdge(center, null);
    edgeBottom.twin = new HalfEdge(headBottom, null);
    edgeBottom.twin.twin = edgeBottom;

    const headLeft = new Vertex(-20, 0, null);
    const edgeLeft = new HalfEdge(center, null);
    edgeLeft.twin = new HalfEdge(headLeft, null);
    edgeLeft.twin.twin = edgeLeft;

    const headTop = new Vertex(0, 100, null);
    const edgeTop = new HalfEdge(center, null);
    edgeTop.twin = new HalfEdge(headTop, null);
    edgeTop.twin.twin = edgeTop;

    center.edges.push(edgeRight, edgeLeft, edgeBottom, edgeTop);
    center.sortEdges();

    expect(center.edges).toEqual([edgeBottom, edgeLeft, edgeTop, edgeRight]);
  });

  it("sorts outgoing edges of all vertices in clockwise order", function () {
    const dir = "data/shapes";
    const testFiles = getTestFiles(dir);

    testFiles.forEach((file) => {
      const json = JSON.parse(fs.readFileSync(path.resolve(dir + "/" + file), "utf8"));
      let dcel = Dcel.fromGeoJSON(json);

      dcel.vertices.forEach((vertex) => {
        const angles = vertex.edges.map((e) => e.getAngle());
        expect(angles.every((v, i, a) => !i || a[i - 1] >= v)).toEqual(true);
      });
    });
  });
});

describe("remove() on a vertex", function () {
  it("return a correct triangle dcel when removing one vertex of a square shape", function () {
    const json = JSON.parse(fs.readFileSync(path.resolve("data/shapes/square.json"), "utf8"));
    const dcel = Dcel.fromGeoJSON(json);

    const squareFace = dcel.getBoundedFaces()[0];
    const vertex = dcel.findVertex(0, 0);
    vertex.remove();

    expect(squareFace.getEdges().length).toBe(3);
    expect(squareFace.getEdges(false).length).toBe(3);
  });
});

describe("remove() on all vertices of a square with a hole", function () {
  let dcel: Dcel;
  beforeEach(function () {
    const json = JSON.parse(fs.readFileSync(path.resolve("data/shapes/square-hole.json"), "utf8"));
    dcel = Dcel.fromGeoJSON(json);
  });

  const outerVertices = [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
  ];

  const innerVertices = [
    [1.25, 1.25],
    [1.25, 1.5],
    [1.5, 1.5],
    [1.5, 1.25],
    [1.25, 1.25],
  ];

  for (const coordinates of outerVertices) {
    it("return a correct triangular dcel when removing one outer vertex", function () {
      const outerSquare = dcel.getBoundedFaces()[0];
      const [x, y] = coordinates;
      dcel.findVertex(x, y).remove();

      expect(outerSquare.getEdges().length).toBe(3);
      expect(outerSquare.getEdges(false).length).toBe(3);
    });
  }

  for (const coordinates of innerVertices) {
    it("return a correct triangular dcel when removing one inner vertex", function () {
      const innerSquare = dcel.getBoundedFaces()[1];
      const [x, y] = coordinates;
      dcel.findVertex(x, y).remove();

      expect(innerSquare.getEdges().length).toBe(3);
      expect(innerSquare.getEdges(false).length).toBe(3);
    });
  }
});
