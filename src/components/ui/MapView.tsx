"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat, transform } from "ol/proj";
import { Feature, Overlay } from "ol";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Circle, Fill, Stroke, Text } from "ol/style";
import {
  defaults as defaultControls,
  FullScreen,
  MousePosition,
  ScaleLine,
  ZoomSlider,
} from "ol/control";
import {
  defaults as defaultInteractions,
  DragRotate,
  PinchRotate,
} from "ol/interaction";
import "ol/ol.css";

import { Coordinate } from "ol/coordinate";
import BaseLayer from "ol/layer/Base";

interface MapViewProps {
  mapCenter: [number, number];
  mapZoom: number;
  userPosition: [number, number] | null;
}


const MapView = ({
  mapCenter,
  mapZoom,
  userPosition,
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [activeLayer, setActiveLayer] = useState("osm");
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map.current && mapRef.current && popupRef.current) {
      // Create popup overlay
      const popup = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        stopEvent: false,
      });

      // Define available layers
      const layers = {
        osm: new TileLayer({
          source: new OSM(),
          visible: true,
          properties: { layerId: "osm" },
        }),
        streets: new TileLayer({
          source: new XYZ({
            url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
            attributions: "© OpenStreetMap contributors",
          }),
          visible: false,
          properties: { layerId: "streets" },
        }),
        satellite: new TileLayer({
          source: new XYZ({
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            attributions: "Powered by Esri",
          }),
          visible: false,
          properties: { layerId: "satellite" },
        }),
        terrain: new TileLayer({
          source: new XYZ({
            url: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
            attributions: "Map tiles by Stamen Design",
          }),
          visible: false,
          properties: { layerId: "terrain" },
        }),
      };

      // Initialize map with reorganized controls
      map.current = new Map({
        target: mapRef.current,
        layers: Object.values(layers),
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }).extend([
          new ZoomSlider(),
          new FullScreen(),
          new MousePosition({
            coordinateFormat: (coords) => {
              const lonLat = transform(
                coords as Coordinate,
                "EPSG:3857",
                "EPSG:4326"
              );
              return `${lonLat[1].toFixed(4)}, ${lonLat[0].toFixed(4)}`;
            },
            className: "custom-mouse-position",
          }),
          new ScaleLine({ units: "metric" }),
        ]),
        interactions: defaultInteractions().extend([
          new DragRotate({
            condition: () => true,
          }),
          new PinchRotate(),
        ]),
        view: new View({
          center: fromLonLat([mapCenter[1], mapCenter[0]]),
          zoom: mapZoom,
          maxZoom: 19,
          minZoom: 2,
        }),
      });

      // Add popup click handler
      map.current.on("click", (evt) => {
        const feature = map.current?.forEachFeatureAtPixel(evt.pixel, (f) => f);
        if (feature) {
          const coords = (feature.getGeometry() as Point).getCoordinates();
          popup.setPosition(coords);
          const properties = feature.getProperties();
          if (properties.name) {
            popupRef.current!.innerHTML = `
              <div class="bg-white p-2 rounded shadow-lg">
                <h3 class="font-bold">${properties.name}</h3>
                <p>${properties.address || ""}</p>
              </div>
            `;
            popup.setPosition(coords);
          }
        } else {
          popup.setPosition(undefined);
        }
      });

      map.current.addOverlay(popup);
    }
  }, []);

  // Layer switcher control
  const handleLayerChange = (layerId: string) => {
    if (!map.current) return;
    map.current.getLayers().forEach((layer: BaseLayer) => {
      const layerProperties = layer.getProperties();
      layer.setVisible(layerProperties.layerId === layerId);
    });
    setActiveLayer(layerId);
  };

  // Update markers when data changes
  useEffect(() => {
    if (!map.current) return;

    // Create vector source and layer for markers
    const vectorSource = new VectorSource();

    // Add pulsing user location marker
    if (userPosition) {
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([userPosition[1], userPosition[0]])),
        name: "Your Location",
      });

      // Add debug information to console
      // console.log("User Position:", {
      //   original: userPosition,
      //   transformed: fromLonLat([userPosition[1], userPosition[0]]),
      // });
      //any

      userFeature.setStyle(
        new Style({
          image: new Circle({
            radius: 12,
            fill: new Fill({ color: "#3B82F6" }),
            stroke: new Stroke({
              color: "#fff",
              width: 3,
            }),
          }),
          text: new Text({
            text: "You",
            font: "12px Arial",
            fill: new Fill({ color: "#fff" }),
            offsetY: 1.5,
          }),
        })
      );

      // Add pulsing effect
      let phase = 0;
      const animate = () => {
        phase = (phase + 1) % 60;
        const radius = 12 + (phase < 30 ? phase : 60 - phase) / 2;

        userFeature.setStyle(
          new Style({
            image: new Circle({
              radius: radius,
              fill: new Fill({
                color: `rgba(59, 130, 246, ${1 - phase / 60})`,
              }),
              stroke: new Stroke({
                color: "#fff",
                width: 3,
              }),
            }),
            text: new Text({
              text: "You",
              font: "12px Arial",
              fill: new Fill({ color: "#fff" }),
              offsetY: 1.5,
            }),
          })
        );

        requestAnimationFrame(animate);
      };

      animate();
      vectorSource.addFeature(userFeature);
    }

    // Add branch markers with improved styling
  
    // Remove existing vector layers
    map.current
      .getLayers()
      .getArray()
      .filter((layer) => layer instanceof VectorLayer)
      .forEach((layer) => map.current?.removeLayer(layer));

    // Add new vector layer
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map.current.addLayer(vectorLayer);
  }, [userPosition]);

  // Update map center when it changes
  useEffect(() => {
    if (!map.current) return;
    map.current.getView().setCenter(fromLonLat([mapCenter[1], mapCenter[0]]));
    map.current.getView().setZoom(mapZoom);
  }, [mapCenter, mapZoom]);

  return (
    <div className="relative" style={{ width: "100%", height: "100%" }}>
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Move layer switcher outside map */}
        <select
          value={activeLayer}
          onChange={(e) => handleLayerChange(e.target.value)}
          className="px-3 py-2 bg-white border rounded-lg shadow-sm"
        >
          <option value="osm">OpenStreetMap</option>
          <option value="streets">Detailed Streets</option>
          <option value="satellite">Satellite</option>
          <option value="terrain">Terrain</option>
        </select>
      </div>

      <div ref={mapRef} className="ol-map rounded-lg overflow-hidden" />
      <div ref={popupRef} className="ol-popup" />
    </div>
  );
};

export default MapView;
