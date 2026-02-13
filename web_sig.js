

// adding map view/////
const myMap = L.map("map", {
  crs: L.CRS.EPSG3857
}).setView([30.386, -3.319], 5);


// define tileLayer/////
let lyrGoogleMap = L.tileLayer('http://mts3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 22,
  maxNativeZoom: 20
})

let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(myMap);


// join all layer in layerControl/////
let baseMaps = {
  "Google-sat": googleSat,
  "Google-Map": lyrGoogleMap,
};

let overlays = L.layerGroup()
let drawnFeatures = new L.FeatureGroup();
let layerControl = L.control.layers(baseMaps).setPosition('topright').addTo(myMap);
layerControl.addOverlay(drawnFeatures, "drawn");

// Leaflet Pluguins////////////
// **********************************

// geocoder////////////
L.Control.geocoder({
  position: 'topleft'
}).addTo(myMap);

// Distance and area measurement
L.control.measure({
  // collapsed: false,
  title: " Measurement"
}).addTo(myMap);

// current Locations////
let curreLocation = L.control.locate({
  // position: "topright",
  flyTo: true,  /// smouth action
  circleStyle: {
    radius: 19
  },
  strings: {
    title: "location"
  },
  showPopup: true
}).addTo(myMap);



const legend = L.control({ position: "bottomleft" });

legend.onAdd = function () {
  this._div = L.DomUtil.create('div', 'legend');
  this._div.innerHTML = '<h4 class="text-xs font-bold mb-2">Legend</h4>';
  return this._div;
};

legend.addTo(myMap);

// print pluguins////
let customActionToPrint = function (context, mode) {
  return function () {
    window.alert("We are printing the MAP. Let's do Custom print here!");
    context._printMode(mode);
  }
};
// Browser Print options
let options = {
  documentTitle: 'GeoMap Print',
  closePopupsOnPrint: false,
  manualMode: false,
  customPrintStyle: {
    color: "gray",
    dashArray: "5,10",
    weight: 2,
    pane: "customPrintPane"
  },
  printModes: [
    L.BrowserPrint.Mode.Landscape("Tabloid", { title: "Tabloid VIEW" }),

    L.BrowserPrint.Mode.Custom("A6", {
      title: "User defined print",
      action: customActionToPrint,
      invalidateBounds: false
    }),

    L.BrowserPrint.Mode.Landscape(),

    L.BrowserPrint.Mode.Portrait(),

    L.BrowserPrint.Mode.Auto("B4", { title: "Auto Print" }),

    L.BrowserPrint.Mode.Custom("B5", { title: "Select area" })
  ]
};

// Add the control to the map
let browserControl = L.control.browserPrint(options).addTo(myMap);

myMap.on("browser-print-start", function (e) {

    const title = document.createElement("div");
    title.innerHTML = "Geo Map"; 

    title.classList.add('title_style');

    e.printMap.getContainer().appendChild(title);

    // ===== LEGEND =====
    const legendClone = legend.getContainer().cloneNode(true);

    legendClone.style.position = "absolute";
    legendClone.style.bottom = "120px";
    legendClone.style.left = "20px";
    legendClone.style.background = "white";
    legendClone.style.padding = "10px";

    e.printMap.getContainer().appendChild(legendClone);
});




// Draw control/////////////
myMap.pm.addControls({
  positions: {
    draw: 'topright',
    edit: 'topright',
  },
  editControls: true,
  drawMarker: true,
  drawPolyline: true,
  drawCircle: false,
  drawText: true,
  drawCircleMarker: false,
  removalMode: true,
  rotateMode: false,
  layerGroup: drawnFeatures
});




//changih 3la hsab smyat li 3ndkom f geoserver
let layer_name = 'casablanca';
let work_space_name = 'sig_web';

const wfsUrl = `http://localhost:8080/geoserver/${work_space_name}/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=${work_space_name}:${layer_name}&outputFormat=application/json&srsName=EPSG:4326`

fetch(wfsUrl)
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: '#ff0000',
                weight: 2
            },
            onEachFeature: (feature, layer) => {
                layer.bindPopup(
                    Object.entries(feature.properties)
                        .map(([k, v]) => `<b>${k}</b>: ${v}`)
                        .join('<br>')
                );
            }
        }).addTo(myMap);
    });





// geojson-----------
let moroccoGeoJson = 'data/morocco_id.geojson';

fetch(moroccoGeoJson)
  .then(response => response.json())
  .then(data => {

    // Add GeoJSON layer
    let moroccoBou = L.geoJson(data, {
      style: Ethnic1Style,
      onEachFeature: onEachFeature
    }).addTo(myMap);

    layerControl.addOverlay(moroccoBou, "Morocco Boundaries");

    updateLegend(data);

  })
  .catch(error => console.error('Error fetching Morocco GeoJSON:', error));


function updateLegend(geojsonData) {

  const uniqueValues = new Set();

  geojsonData.features.forEach(f => {
    if (f.properties && f.properties.region) {
      uniqueValues.add(f.properties.region);
    }
  });

  const categories = Array.from(uniqueValues);

  let content = '<h4 class="text-xs font-bold mb-2">Legend</h4>';

  categories.forEach(category => {
    content += `
            <div class="flex items-center mb-1">
                <div class="w-3 h-3 mr-2" style="background:${getColor(category)}"></div>
                <span class="text-xs">${category}</span>
            </div>
        `;
  });

  legend._div.innerHTML = content;
}
function getColor(type) {
  return type === "A" ? "#e41a1c" :
    type === "B" ? "#377eb8" :
      type === "C" ? "#4daf4a" :
        "#999999";
}


function onEachFeature(feature, layer) {
  if (feature.properties) {

    let popupHtml = `
            <div class="p-2 font-sans">
                <h4 class="text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-3 border-b border-slate-100 pb-2">
                    Feature Details
                </h4>
                <table class="w-full text-xs">
                    <tbody>
        `;

    for (const [key, value] of Object.entries(feature.properties)) {
      const formattedKey = key.replace(/_/g, ' ').toUpperCase();

      popupHtml += `
                <tr class="border-b border-slate-50 last:border-0">
                    <td class="py-1.5 pr-4 font-bold text-slate-400 text-[9px] uppercase tracking-tight">${formattedKey}</td>
                    <td class="py-1.5 font-semibold text-slate-700 text-right">${value || 'N/A'}</td>
                </tr>
            `;
    }

    popupHtml += `
                    </tbody>
                </table>
            </div>
        `;

    layer.bindPopup(popupHtml, {
      closeButton: true,
      maxWidth: 300,
      className: 'custom-map-popup'
    });
    layer.on({
      mouseover: function (e) {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#10b981',
          fillOpacity: 0.7
        });
      },
      mouseout: function (e) {
        layer.setStyle({ weight: 2, color: 'rgb(145, 228, 0)', fillOpacity: 0.2 });
      }
    });
  }
}


// file imported styling/////////////////////
function Ethnic1Style() {
  return {
    fillColor: 'rgb(145, 228, 0)',
    weight: 3,
    opacity: 1,
    color: 'rgb(145, 228, 0)',
    dashArray: '1',
    fillOpacity: 0.2
  };
}
