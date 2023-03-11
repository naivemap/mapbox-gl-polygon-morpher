/**
 * Morph smoothly between Polygons or MultiPolygons.
 *
 * @packageDocumentation
 */

import { toGeoJSON } from 'geojson-tools'
import Animate from './animate'

/**
 * The option of the morpher.
 */
export interface MorphOption {
  /**
   * Maximum duration of morphing
   *
   * @defaultValue 350
   */
  maxDuration?: number
}

/**
 * Morph smoothly between Polygons or MultiPolygons.
 */
export default class PolygonMorpher {
  private source: mapboxgl.GeoJSONSource
  private sourceLoaded = false
  private morphOption: MorphOption
  private feature?: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>

  /**
   * Constructs a new instance of the PolygonMorpher class
   * @param {mapboxgl.GeoJSONSource} source The GeoJSONSource to be updated.
   * @param option The option of the morpher.
   */
  constructor(source: mapboxgl.GeoJSONSource, option?: MorphOption) {
    this.source = source
    this.morphOption = Object.assign(
      {
        maxDuration: 350
      },
      option
    )
  }

  /**
   * Morph to the given feature
   *
   * @param {GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>} feature Feature
   */
  public async morph(feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>) {
    if (!this.sourceLoaded) {
      // Get Feature from source
      this.feature = await this.initSource(this.source)
    }
    if (!this.feature) {
      // There is no feature
      this.feature = feature
      this.source.setData(feature)
      return
    }

    const oldFeature = this.feature
    const newFeature = feature
    this.feature = feature

    const anim = new Animate(newFeature, oldFeature, this.morphOption.maxDuration)
    // Animation frame
    const frame = () => {
      if (anim.canceled) {
        return
      }

      const elapsed = +new Date() - anim.startTime
      let t

      // Showing oldFeature (phase 1)
      if (elapsed <= anim.waitDuration) {
        t = Math.min(elapsed / anim.waitDuration, 1)

        window.requestAnimationFrame(frame)
      }
      // Morphing from district oldFeature to newFeature (phase 2)
      else if (anim.morphDuration > 0 && elapsed - anim.waitDuration <= anim.morphDuration) {
        t = Math.min((elapsed - anim.waitDuration) / anim.morphDuration, 1)

        const shape = anim.interpolator(t)
        let f: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>

        // Need to convert MultiPolygons back to geojson
        if (shape[0][0][0]) {
          f = {
            type: 'Feature',
            properties: oldFeature.properties,
            geometry: toGeoJSON([shape], 'MultiPolygon')
          }
        } else {
          // Don't bother converting to geojson for polygons
          f = {
            type: 'Feature',
            properties: oldFeature.properties,
            geometry: { type: 'Polygon', coordinates: [shape] }
          }
        }
        this.source.setData(f)
        window.requestAnimationFrame(frame)
      } else {
        this.source.setData(feature)
      }
    }
    frame()
  }

  private async initSource(source: mapboxgl.GeoJSONSource) {
    // @ts-ignore
    const sourceData = source._data
    let geojsonData: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>

    if (typeof sourceData === 'string') {
      const res = await fetch(sourceData)
      geojsonData = await res.json()
    } else {
      geojsonData = sourceData
    }

    let feature: GeoJSON.Feature<GeoJSON.Geometry>
    if (geojsonData.type === 'FeatureCollection') {
      if (geojsonData.features.length === 1) {
        // FeatureCollection has only one feature
        feature = geojsonData.features[0]
      } else {
        // return
        this.sourceLoaded = true
        return undefined
      }
    } else {
      // Feature
      feature = geojsonData as GeoJSON.Feature<GeoJSON.Geometry>
    }

    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      this.sourceLoaded = true
      return feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
    } else {
      throw new Error("The type of feature must be 'Polygon' or 'MultiPolygon'.")
    }
  }
}
