import Dcel from "../lib/DCEL/Dcel";
import { getJSON } from "../lib/utilities";
import { getMapFrom } from "./mapOutput";

export function drawMapGrid(files: string[]): void {
  const gridID = "map-grid";
  let grid = document.getElementById(gridID);
  if (grid) grid.innerHTML = "";
  else {
    grid = document.createElement("div");
    grid.setAttribute("id", gridID);
    document.body.appendChild(grid);
  }

  let templateColumns;
  if (files.length === 1) {
    templateColumns = "1fr";
  } else if (files.length > 1 && files.length <= 5 && files.length != 3) {
    templateColumns = "1fr 1fr";
  } else {
    templateColumns = "1fr 1fr 1fr";
  }
  grid.style.gridTemplateColumns = templateColumns;

  files.forEach((file) => {
    const map = document.createElement("div");
    const name = file.slice(file.lastIndexOf("/") + 1, -5);
    map.id = name;
    map.className = "map";
    if (grid) grid.appendChild(map);
  });
}

export function draw(inputData: string[]) {
  drawMapGrid(inputData);
  inputData.forEach(async (test) => {
    const name = test.slice(test.lastIndexOf("/") + 1, -5);
    const data = await getJSON("data/" + test);
    // TODO: validate() data (within getJSON??) check if of type polygon or multipolygon, check crs and save it for later?
    const dcel = Dcel.fromGeoJSON(data);
    dcel.schematize();
    dcel.toConsole(name);
    getMapFrom(dcel, name);
  });
}
