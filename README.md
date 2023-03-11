# @naivemap/mapbox-gl-polygon-morpher

Morph smoothly between Polygons or MultiPolygons.

[API Reference](./docs/index.md)

## Install

```bash
npm i mapbox-gl @naivemap/mapbox-gl-polygon-morpher
```

## Quick start

```js
import PolygonMorpher from '@naivemap/mapbox-gl-polygon-morpher'

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.5, 40],
  zoom: 9
})

map.on('load', () => {
  map.addSource('geojson-source', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })
  map.addLayer(
    {
      id: 'poly-layer',
      type: 'fill',
      source: 'geojson-source',
      paint: {
        'fill-color': 'rgba(152, 224, 173, 0.5)'
      }
    },
    'aeroway-line'
  )
  const geojsonSource = map.getSource('geojson-source') as mapboxgl.GeoJSONSource
  const polygonMorpher = new PolygonMorpher(geojsonSource)

  polygonMorpher.morph(feature)
})
```

## UMD

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css" rel="stylesheet" />
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@naivemap/mapbox-gl-polygon-morpher"></script>
  </head>
  <body>
    <div id="map" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"></div>
    <script>
      const polygonMorpher = new PolygonMorpher(geojsonSource)
    </script>
  </body>
</html>
```
