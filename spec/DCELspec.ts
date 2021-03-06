import fs from "fs";
import path from "path";
import { hint } from "@mapbox/geojsonhint";
import { getTestFiles } from "./test-setup";
import Dcel from "../src/lib/DCEL/Dcel";
import Face from "../src/lib/DCEL/Face";

describe("A Dcel of 2 adjacent squares", function () {
  const json = JSON.parse(fs.readFileSync(path.resolve("data/shapes/2plgn-adjacent.json"), "utf8"));
  const dcel = Dcel.fromGeoJSON(json);

  it("has 1 unbounded face", function () {
    expect(dcel.getUnboundedFace()).toEqual(jasmine.any(Object));
  });

  it("has 3 faces", function () {
    expect(dcel.faces.length).toBe(3);
  });

  it("has 6 vertices", function () {
    expect(dcel.vertices.size).toBe(6);
  });

  it("has 14 edges", function () {
    expect(dcel.halfEdges.size).toBe(14);
  });

  it("has inner faces with the right amount of edges", function () {
    const edgeCount = dcel.getBoundedFaces().reduce((counter: number[], f: Face) => {
      counter.push(f.getEdges().length);
      return counter;
    }, []);
    expect(edgeCount.sort()).toEqual([4, 4].sort());
  });
});

describe("A Dcel of 3 adjacent squares", function () {
  const json = JSON.parse(fs.readFileSync(path.resolve("data/shapes/3plgn-adjacent.json"), "utf8"));
  const dcel = Dcel.fromGeoJSON(json);

  it("has 1 unbounded face", function () {
    expect(dcel.getUnboundedFace()).toEqual(jasmine.any(Object));
  });

  it("has 4 faces", function () {
    expect(dcel.faces.length).toBe(4);
  });

  it("has 8 vertices", function () {
    expect(dcel.vertices.size).toBe(8);
  });

  it("has 20 edges", function () {
    expect(dcel.halfEdges.size).toBe(20);
  });

  it("has inner faces with the right amount of edges", function () {
    const edgeCount = dcel.getBoundedFaces().reduce((counter: number[], f: Face) => {
      counter.push(f.getEdges().length);
      return counter;
    }, []);
    expect(edgeCount.sort()).toEqual([4, 4, 4]);
  });
});

describe("getBbox()", function () {
  it("returns the correct boundingbox of a given dcel", function () {
    const plgn1 = JSON.parse(fs.readFileSync(path.resolve("data/shapes/square.json"), "utf8"));
    const plgn2 = JSON.parse(
      fs.readFileSync(path.resolve("data/shapes/2plgn-adjacent.json"), "utf8")
    );
    const plgn3 = JSON.parse(
      fs.readFileSync(path.resolve("data/shapes/3plgn-adjacent.json"), "utf8")
    );

    let bboxPlgn1 = Dcel.fromGeoJSON(plgn1).getBbox();
    let bboxPlgn2 = Dcel.fromGeoJSON(plgn2).getBbox();
    let bboxPlgn3 = Dcel.fromGeoJSON(plgn3).getBbox();

    expect(bboxPlgn1).toEqual([0, 0, 200, 200]);
    expect(bboxPlgn2).toEqual([0, 0, 4, 2]);
    expect(bboxPlgn3).toEqual([0, 0, 2, 2]);
  });
});

describe("getVertices()", function () {
  let dcel: Dcel;

  beforeEach(function () {
    const polygon = JSON.parse(fs.readFileSync(path.resolve("data/shapes/square.json"), "utf8"));
    dcel = Dcel.fromGeoJSON(polygon);
    dcel.preProcess();
    dcel.classify();
  });

  it("returns vertices of type insignificant if specified", function () {
    expect(dcel.getVertices(false).every((v) => !v.significant)).toBeTruthy();
  });
  it("returns vertices of type significant if specified", function () {
    expect(dcel.getVertices(true).every((v) => v.significant)).toBeTruthy();
  });
  it("returns all vertices if no type specified", function () {
    expect(dcel.getVertices().length).toBe([...dcel.vertices].length);
  });
});

describe("getDiameter()", function () {
  it("returns the correct diameter", function () {
    const plgn1 = JSON.parse(fs.readFileSync(path.resolve("data/shapes/square.json"), "utf8"));
    const plgn3 = JSON.parse(
      fs.readFileSync(path.resolve("data/shapes/3plgn-adjacent.json"), "utf8")
    );

    expect(Dcel.fromGeoJSON(plgn1).getDiameter()).toBe(
      Math.sqrt(Math.pow(200, 2) + Math.pow(200, 2))
    );
    expect(Dcel.fromGeoJSON(plgn3).getDiameter()).toBe(Math.sqrt(Math.pow(2, 2) + Math.pow(2, 2)));
  });
});

describe("schematize() returns a result which can be turned into a valid geojson", function () {
  it("for simplied boundaries of Austria.", function () {
    const inputJson = JSON.parse(
      fs.readFileSync(path.resolve("data/geodata/AUT_adm1-simple.json"), "utf8")
    );
    const dcel = Dcel.fromGeoJSON(inputJson);
    dcel.schematize();
    const outputJson = dcel.toGeoJSON();
    const outputJsonPretty = JSON.stringify(outputJson, null, 4);
    const errors = hint(outputJsonPretty);
    if (errors.length > 0) console.log(errors);
    expect(errors.length).toBe(0);
    expect(inputJson.features.length).toBe(outputJson.features.length);
  });
});

describe("schematize() returns a result which can be turned into a valid geojson", function () {
  const dir = "data/shapes";
  const testFiles = getTestFiles(dir);

  testFiles.forEach((file) => {
    // TODO: run specs only on some of the shapes?
    it("for the simple input " + file, function () {
      const inputJson = JSON.parse(fs.readFileSync(path.resolve(dir + "/" + file), "utf8"));
      const dcel = Dcel.fromGeoJSON(inputJson);
      dcel.schematize();
      const outputJson = dcel.toGeoJSON();
      const outputJsonPretty = JSON.stringify(outputJson, null, 4);
      const errors = hint(outputJsonPretty);
      if (errors.length > 0) console.log(errors);
      expect(errors.length).toBe(0);
      expect(inputJson.features.length).toBe(outputJson.features.length);
    });
  });
});
