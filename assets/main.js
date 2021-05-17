import DCEL from "./lib/dcel/Dcel.mjs";
import { logDCEL, mapFromDCEL } from "./lib/dcel/Utilities.js";

const tests = [
  // 'assets/data/geodata/ne_110m_africa_admin0.json',
  // 'assets/data/geodata/nuts1-ger-simple.json',
  // "assets/data/geodata/AUT_adm1.json",
  // "assets/data/geodata/nuts1-ger.json",
  // "assets/data/geodata/central-austria.json",
  // "assets/data/shapes/square.json",
  // 'assets/data/shapes/square-islands.json',
  // "assets/data/shapes/square-hole.json",
  "assets/data/shapes/triangle.json",
  // "assets/data/shapes/triangle-hole.json",
  // "assets/data/shapes/2triangle-adjacent.json",
  // "assets/data/shapes/2plgn.json",
  // "assets/data/shapes/2plgn-adjacent.json",
  // "assets/data/shapes/2plgn-islands.json",
  // "assets/data/shapes/3plgn.json",
  // "assets/data/shapes/3plgn-complex.json",
];

async function getJSON(path) {
  const response = await fetch(path);
  return response.json();
}

tests.forEach(async (test) => {
  const data = await getJSON(test);
  const name = test.slice(test.lastIndexOf("/") + 1, -5);

  const subdivision = DCEL.buildFromGeoJSON(data);
  console.log(name, "-----");
  const e = subdivision.getInnerFaces()[0].edge.getCycle()[2];
  console.log("bisected edge:", e.uuid);
  e.bisect();

  // subdivision.getInnerFaces().forEach((f) => {
  //   f.edge.getCycle().forEach((e) => {
  //     e.bisect();
  //   });
  // });

  // subdivision.getInnerFaces().forEach((f) => {
  //   console.log(f);
  //   f.edge.subdivideToThreshold(subdivision.epsilon);
  // });

  logDCEL(subdivision);
  mapFromDCEL(subdivision, name);
});
