import intersect from '@turf/intersect'
import area from '@turf/area'
import { interpolate, interpolateAll, combine, separate } from 'flubber'
import { toArray, toGeoJSON } from 'geojson-tools'

export default class Animate {
  waitDuration = 75
  morphDuration = 0
  startTime: number
  interpolator: any
  canceled = false

  constructor(
    newFeature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
    oldFeature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
    maxMorphDuration = 350
  ) {
    const intersectFeature = intersect(newFeature, oldFeature)
    const areaIntersect = intersectFeature ? area(intersectFeature) : 0
    const areaOldFeature = area(oldFeature)
    const areaNewFeature = area(newFeature)
    const maxIntersect = 0.99

    if (
      areaIntersect / areaOldFeature < maxIntersect ||
      areaIntersect / areaNewFeature < maxIntersect
    ) {
      this.morphDuration = Math.min(
        Math.max(1 - areaIntersect / areaNewFeature, 1 - areaIntersect / areaOldFeature) * 25000,
        maxMorphDuration
      )
    }

    this.startTime = +new Date()

    // Prepare multipolygons as needed
    const oldValAsArray = toArray(oldFeature.geometry)
    const newValAsArray = toArray(newFeature.geometry)
    let sortedOldVal = null as unknown as GeoJSON.Position[] | GeoJSON.Position[][]
    let sortedNewVal = null as unknown as GeoJSON.Position[] | GeoJSON.Position[][]

    if (oldFeature.geometry.type === 'MultiPolygon') {
      sortedOldVal = (oldValAsArray as GeoJSON.Position[][]).sort(
        (a, b) =>
          area({ type: 'Polygon', coordinates: [b] }) - area({ type: 'Polygon', coordinates: [a] })
      )
    }
    if (newFeature.geometry.type === 'MultiPolygon') {
      sortedNewVal = (newValAsArray as GeoJSON.Position[][]).sort(
        (a, b) =>
          area({ type: 'Polygon', coordinates: [b] }) - area({ type: 'Polygon', coordinates: [a] })
      )
    }

    // MultiPolygons --> MultiPolygons (with same # of polygons)
    if (sortedOldVal && sortedNewVal && sortedOldVal.length === sortedNewVal.length) {
      this.interpolator = interpolateAll(sortedOldVal, sortedNewVal, {
        string: false,
        single: true,
        match: true,
      })
    }

    // Polygon --> MultiPolygons (separate)
    else if (
      oldFeature.geometry.type === 'Polygon' &&
      newFeature.geometry.type === 'MultiPolygon'
    ) {
      this.interpolator = separate(oldValAsArray, sortedNewVal, { string: false, single: true })
    }
    // MultiPolygons --> Polygon (combine)
    else if (
      oldFeature.geometry.type === 'MultiPolygon' &&
      newFeature.geometry.type === 'Polygon'
    ) {
      this.interpolator = combine(sortedOldVal, newValAsArray, { string: false, single: true })
    }

    // Default: morph largest polygon from each
    else {
      this.interpolator = interpolate(
        oldFeature.geometry.type === 'MultiPolygon'
          ? oldFeature.geometry.coordinates.sort(
              (a, b) =>
                area({ type: 'Polygon', coordinates: b }) -
                area({ type: 'Polygon', coordinates: a })
            )[0][0]
          : oldFeature.geometry.coordinates[0],
        newFeature.geometry.type === 'MultiPolygon'
          ? newFeature.geometry.coordinates.sort(
              (a, b) =>
                area({ type: 'Polygon', coordinates: b }) -
                area({ type: 'Polygon', coordinates: a })
            )[0][0]
          : newFeature.geometry.coordinates[0],
        { string: false }
      )
    }
  }

  cancel() {
    // do something here?
    this.canceled = true
  }
}
