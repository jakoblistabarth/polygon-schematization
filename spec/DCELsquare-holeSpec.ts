import fs from "fs";
import path from "path";
import Dcel from "../src/lib/DCEL/Dcel";

describe("A Dcel of a single square with one square hole", function () {
  let dcel: Dcel;

  beforeEach(function () {
    const polygon = JSON.parse(
      fs.readFileSync(path.resolve("data/shapes/square-hole.json"), "utf8")
    );
    dcel = Dcel.fromGeoJSON(polygon);
  });

  it("has 1 unbounded face", function () {
    expect(dcel.getUnboundedFace()).toEqual(jasmine.any(Object));
  });

  it("has 3 faces (1 outer, 2 inner) in total", function () {
    expect(dcel.getFaces().length).toBe(3);
  });

  it("has 8 vertices", function () {
    expect(dcel.vertices.size).toBe(8);
  });

  it("has 16 halfedges", function () {
    expect(dcel.halfEdges.size).toBe(16);
  });
});
