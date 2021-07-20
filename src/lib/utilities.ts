import * as geojson from "geojson";
import shp from "shpjs";
import Point from "./geometry/Point";

export async function getJSON(path: string) {
  const response = await fetch(path);
  return response.json();
}

export async function getShp(path: string) {
  return await shp(path);
}

export async function loadData(path: string) {
  const suffix = path.split(".").pop();

  if (suffix === "zip") return await getShp(window.location.href + path);

  if (suffix === "json") return await getJSON(path);
}

export function crawlArray(array: any[], index: number, n: number) {
  return (((index + n) % array.length) + array.length) % array.length;
}

export function getOccurrence(array: any[], value: string | number) {
  return array.filter((v) => v === value).length;
}
export interface FeatureCollectionPlanar extends geojson.FeatureCollection {
  crs: Crs;
}

export type Crs = {
  type: string;
  properties: {
    name: string;
  };
};

export function createGeoJSON(features: geojson.Feature[], crs: Crs): FeatureCollectionPlanar {
  return {
    crs: crs,
    type: "FeatureCollection",
    features: features,
  };
}

export const groupBy = (key: string) => (array: any[]) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

/**
 *
 * @param angle in radians
 * @returns a unit vector
 */
export function getUnitVector(angle: number): number[] {
  angle = angle > Math.PI ? angle - Math.PI * 2 : angle;
  return [Math.cos(angle), Math.sin(angle)];
}

export function copyInstance(original: object) {
  return Object.assign(Object.create(Object.getPrototypeOf(original)), original);
}

/**
 * Calculates the area of the irregular polyon defined by a set of points.
 * @param points an array of Points, which has to be sorted (either clockwise or counter-clockwise)
 * @returns the Area of the polygon
 */
export function getPolygonArea(points: Point[]): number {
  let total = 0;

  for (let i = 0; i < points.length; i++) {
    const addX = points[i].x;
    const addY = points[i == points.length - 1 ? 0 : i + 1].y;
    const subX = points[i == points.length - 1 ? 0 : i + 1].x;
    const subY = points[i].y;

    total += addX * addY * 0.5;
    total -= subX * subY * 0.5;
  }

  return Math.abs(total);
}
