import fs from "fs";
import path from "path";
import { createEdgeVertexSetup, TestSetup } from "./test-setup";
import Dcel from "../assets/lib/dcel/Dcel";
import { config } from "../assets/schematization.config";
import CRegular from "../assets/lib/OrientationRestriction/CRegular";

describe("isDeviating()", function () {
  let s: TestSetup;

  beforeEach(function () {
    s = createEdgeVertexSetup();
  });

  it("returns true for an deviating edge", function () {
    s.directions.od53.assignedDirection = 2;
    expect(s.directions.od53.isDeviating()).toBe(true);
  });

  it("returns true for an deviating edge", function () {
    s.directions.od53.assignedDirection = 3;
    expect(s.directions.od53.isDeviating()).toBe(true);
    s.dcel.config = { ...config, c: new CRegular(4) };
    expect(s.directions.od53.isDeviating()).toBe(true);
  });

  it("returns false for a basic edge", function () {
    s.directions.od53.assignedDirection = 1;
    expect(s.directions.od53.isDeviating()).toBe(false);
    s.dcel.config = { ...config, c: new CRegular(4) };
    expect(s.directions.od53.isDeviating()).toBe(false);
  });

  it("returns false for a basic edge", function () {
    s.directions.od333.assignedDirection = 0;
    expect(s.directions.od333.isDeviating()).toBe(false);
    s.dcel.config = { ...config, c: new CRegular(4) };
    expect(s.directions.od333.isDeviating()).toBe(false);
  });

  it("returns false for a basic edge", function () {
    s.directions.od53.assignedDirection = 0;
    expect(s.directions.od53.isDeviating()).toBe(false);
  });

  it("returns false for a for a basic aligned edge", function () {
    s.directions.od90.assignedDirection = 1;
    expect(s.directions.od90.isDeviating()).toBe(false);
  });

  it("returns true for a for a deviating aligned edge", function () {
    s.directions.od90.assignedDirection = 2;
    expect(s.directions.od90.isDeviating()).toBe(true);
  });

  it("returns false for a for a basic aligned edge", function () {
    s.directions.od90.assignedDirection = 2;
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od90.isDeviating()).toBe(false);
  });

  it("returns false for a for a basic aligned edge", function () {
    s.directions.od315.assignedDirection = 7;
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od315.isDeviating()).toBe(false);
  });
});

describe("getSignificantVertex()", function () {
  let s: TestSetup;
  beforeEach(function () {
    s = createEdgeVertexSetup();
  });

  it("returns an significant endpoint if one is specified", function () {
    const significantVertex = s.directions.od53.getSignificantVertex();
    expect(significantVertex.significant).toBeTrue();
  });
  it("returns null if none of its endpoints are significant", function () {
    s.o.significant = false;
    expect(s.directions.od53.getSignificantVertex()).toBeUndefined();
  });
});

describe("Given the examples in the paper of buchin et al., classify() works as expected on example", function () {
  let s: TestSetup;
  beforeEach(function () {
    s = createEdgeVertexSetup();
  });

  it("a", function () {
    s.o.edges.push(s.directions.od53, s.directions.od217);
    expect(s.directions.od53.classify()).toBe("unalignedBasic");
    expect(s.directions.od217.classify()).toBe("unalignedBasic");
  });

  it("b", function () {
    s.o.edges.push(s.directions.od53, s.directions.od180, s.directions.od270);
    expect(s.directions.od53.classify()).toBe("unalignedBasic");
    expect(s.directions.od180.classify()).toBe("alignedBasic");
    expect(s.directions.od270.classify()).toBe("alignedBasic");
  });

  it("c", function () {
    s.o.edges.push(s.directions.od37, s.directions.od90, s.directions.od104);
    expect(s.directions.od37.classify()).toBe("unalignedBasic");
    expect(s.directions.od90.classify()).toBe("alignedBasic");
    expect(s.directions.od104.classify()).toBe("unalignedBasic");
  });

  it("d", function () {
    s.o.edges.push(s.directions.od37, s.directions.od53);
    expect(s.directions.od37.classify()).toBe("evading");
    expect(s.directions.od53.classify()).toBe("evading");
  });

  it("e", function () {
    s.o.edges.push(s.directions.od37, s.directions.od53, s.directions.od76);
    expect(s.directions.od37.classify()).toBe("evading");
    expect(s.directions.od53.classify()).toBe("evading");
    expect(s.directions.od76.classify()).toBe("unalignedDeviating");
  });

  it("f", function () {
    s.o.edges.push(s.directions.od0, s.directions.od37, s.directions.od53, s.directions.od76);
    expect(s.directions.od0.classify()).toBe("alignedDeviating");
    expect(s.directions.od37.classify()).toBe("evading");
    expect(s.directions.od53.classify()).toBe("evading");
    expect(s.directions.od76.classify()).toBe("unalignedDeviating");
  });

  it("g", function () {
    s.o.edges.push(s.directions.od315, s.directions.od333, s.directions.od53, s.directions.od76);
    expect(s.directions.od315.classify()).toBe("evading");
    expect(s.directions.od333.classify()).toBe("evading");
    expect(s.directions.od53.classify()).toBe("unalignedBasic");
    expect(s.directions.od76.classify()).toBe("unalignedDeviating");
  });

  it("h", function () {
    s.o.edges.push(s.directions.od53, s.directions.od217);
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od53.classify()).toBe("unalignedBasic");
    expect(s.directions.od217.classify()).toBe("unalignedBasic");
  });

  it("i", function () {
    s.o.edges.push(s.directions.od53, s.directions.od180, s.directions.od270);
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od53.classify()).toBe("unalignedBasic");
    expect(s.directions.od180.classify()).toBe("alignedBasic");
    expect(s.directions.od270.classify()).toBe("alignedBasic");
  });

  it("j", function () {
    s.o.edges.push(s.directions.od53, s.directions.od90, s.directions.od104);
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od53.classify()).toBe("unalignedBasic");
    expect(s.directions.od90.classify()).toBe("alignedBasic");
    expect(s.directions.od104.classify()).toBe("unalignedBasic");
  });

  it("k", function () {
    s.o.edges.push(s.directions.od37, s.directions.od53);
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od37.classify()).toBe("unalignedBasic");
    expect(s.directions.od53.classify()).toBe("unalignedBasic");
  });

  it("l", function () {
    s.o.edges.push(s.directions.od37, s.directions.od53, s.directions.od76);
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od37.classify()).toBe("unalignedBasic");
    expect(s.directions.od53.classify()).toBe("evading");
    expect(s.directions.od76.classify()).toBe("evading");
  });

  it("m", function () {
    s.o.edges.push(s.directions.od0, s.directions.od14, s.directions.od53, s.directions.od76);
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od0.classify()).toBe("alignedDeviating");
    expect(s.directions.od14.classify()).toBe("unalignedBasic");
    expect(s.directions.od53.classify()).toBe("evading");
    expect(s.directions.od76.classify()).toBe("evading");
  });

  it("n", function () {
    s.o.edges.push(s.directions.od315, s.directions.od333, s.directions.od53, s.directions.od76);
    s.dcel.config = { ...config, c: new CRegular(4) };

    expect(s.directions.od315.classify()).toBe("alignedBasic");
    expect(s.directions.od333.classify()).toBe("unalignedBasic");
    expect(s.directions.od53.classify()).toBe("evading");
    expect(s.directions.od76.classify()).toBe("evading");
  });
});

describe("classifyEdges() in a classification where all edges are classified and a halfedge and its twin share the same class", function () {
  it("on simple test data", function () {
    const json = JSON.parse(
      fs.readFileSync(path.resolve("assets/data/shapes/edge-cases.json"), "utf8")
    );
    const dcel = Dcel.fromGeoJSON(json);
    dcel.preProcess();
    dcel.classify();
    const edgesWithoutAssignedAngles = dcel
      .getHalfEdges()
      .filter((edge) => edge.assignedDirection === undefined);
    const edgesWithoutClassification = dcel
      .getHalfEdges()
      .filter((edge) => edge.class === undefined);
    const edgesWithDivergingClasses = dcel
      .getHalfEdges()
      .filter((edge) => edge.class !== edge.twin.class);

    expect(edgesWithoutAssignedAngles.length).toBe(0);
    expect(edgesWithDivergingClasses.length).toBe(0);
    expect(edgesWithoutClassification.length).toBe(0);
  });

  it("on geo data", function () {
    const json = JSON.parse(
      fs.readFileSync(path.resolve("assets/data/geodata/ne_110m_admin_0_countries.json"), "utf8")
    );
    const dcel = Dcel.fromGeoJSON(json);
    dcel.preProcess();
    dcel.classify();
    const edgesWithoutAssignedAngles = dcel
      .getHalfEdges()
      .filter((edge) => edge.assignedDirection === undefined);
    const edgesWithoutClassification = dcel
      .getHalfEdges()
      .filter((edge) => edge.class === undefined);
    const edgesWithDivergingClasses = dcel
      .getHalfEdges()
      .filter((edge) => edge.class !== edge.twin.class);

    expect(edgesWithoutAssignedAngles.length).toBe(0);
    expect(edgesWithDivergingClasses.length).toBe(0);
    expect(edgesWithoutClassification.length).toBe(0);
  });
});
