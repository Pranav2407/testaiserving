
import {cachedFetch} from "../utils/cache";
import { initLander } from "../../core/lander";
import { eventNames } from "../../constants";
let tbinit = {
    [eventNames.ic] :  { notify: 'event', name: 'CTA-Click', id: 1795853 },
    [eventNames.tyimp]:{notify: 'event', name: 'AIBrowser_Generic_Install', id: 1795853}
}
initLander("Maps",tbinit,"Maps");
document.addEventListener("DOMContentLoaded", function () {
  
  const platform = new H.service.Platform({
    apikey: "TX9wE3p-F-AtjhSulxYtYHVyowotSAliYCQadq7KQj0",
  });
  let defaultLayers;
  let behavior;
  let ui;
  let map;
  // Initialize map first
  const engineType = H.Map.EngineType["HARP"];
  defaultLayers = platform.createDefaultLayers({
    engineType: engineType,
  });
  let mapContainer = document.querySelector(".map-container");
  map = new H.Map(mapContainer, defaultLayers.raster.normal.map, {
    engineType: engineType,
    zoom: 12,
    center: { lat: 40.7128, lng: -74.006 },
    pixelRatio: window.devicePixelRatio || 1,
  });
  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  ui = H.ui.UI.createDefault(map, defaultLayers);
  window.addEventListener("resize", () => map.getViewPort().resize());

  // Function to create popup for markers
  function createMarkerPopup(title, address, phoneNumber = null, websites = []) {
    const popupContent = document.createElement('div');
    popupContent.className = 'p-4 bg-white shadow-lg border border-gray-200 max-w-xs m-0 popupstyle';
    popupContent.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-primary/10 rounded-lg">
          <i class="ri-map-pin-2-line text-primary text-lg"></i>
        </div>
        <div class="flex-1">
          <h3 class="text-base font-semibold text-gray-900 mb-1">${title}</h3>
          <p class="text-sm text-gray-600 mb-2">${address}</p>
          ${phoneNumber ? `
            <div class="flex items-center gap-2 mb-1">
              <i class="ri-phone-line text-gray-400 text-sm"></i>
              <a href="tel:${phoneNumber}" class="text-sm text-gray-600 hover:text-primary">${phoneNumber}</a>
            </div>
          ` : ''}
          ${websites.map(site => `
            <div class="flex items-center gap-2 mb-1">
              <i class="ri-global-line text-gray-400 text-sm"></i>
              <a href="${site.value}" target="_blank" class="text-sm text-gray-600 hover:text-primary truncate">${site.value}</a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    return new H.ui.InfoBubble(new H.geo.Point(0, 0), {
      content: popupContent,

    });
  }

  // Function to add click event to marker
  function addMarkerClickEvent(marker, popup) {
    // Remove any existing event listeners
    if (marker._popupHandler) {
      marker.removeEventListener('tap', marker._popupHandler);
    }
    
    // Create new event handler
    marker._popupHandler = function(evt) {
      // Close any existing popups
      ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
      
      const position = marker.getGeometry();
      popup.setPosition(position);
      ui.addBubble(popup);
      
      // Prevent event from bubbling to map
      evt.stopPropagation();
    };
    
    // Add the new event listener
    marker.addEventListener('tap', marker._popupHandler);
  }

  // Add map click event to close popups
  map.addEventListener('tap', function(evt) {
    // Close all popups when clicking on the map
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
  });

  function handleMapToggle(isMapVisible=false){
    const mapContainer = document.getElementById("mapContainer");
    const mapToggleBtn = document.getElementById("mapToggleBtn");
    if(isMapVisible){  
      mapContainer.classList.add("translate-x-full");
      mapToggleBtn.classList.remove("fixed");
      mapToggleBtn.classList.add("absolute");
      // mapToggleBtn.classList.remove("top-6");
      // mapToggleBtn.classList.remove("left-4");
      // mapToggleBtn.classList.add("top-4");
      // mapToggleBtn.classList.add("right-4");
    }else{
      mapContainer.classList.remove("translate-x-full");
      mapToggleBtn.classList.add("fixed");
      mapToggleBtn.classList.remove("absolute");
      // mapToggleBtn.classList.remove("top-4");
      // mapToggleBtn.classList.remove("right-4");
      // mapToggleBtn.classList.add("top-6");
      // mapToggleBtn.classList.add("left-4");
    }
  }
  // Map toggle functionality
  const mapToggleBtn = document.getElementById("mapToggleBtn");
  const closeMapBtn = document.getElementById("closeMapBtn");
  function toggleMap() {
    const mapContainer = document.getElementById("mapContainer");
    const isMapVisible = !mapContainer.classList.contains("translate-x-full");
    handleMapToggle(isMapVisible);
    if (isMapVisible) {
    } else {
      if (map && map.getViewPort) {
        setTimeout(() => {
          map.getViewPort().resize();
        }, 300);
      }
    }
  }
  // Show map by default on desktop
  if (window.innerWidth >= 1200) {
    const mapContainer = document.getElementById("mapContainer");
    mapContainer.classList.remove("translate-x-full");
    if (map && map.getViewPort) {
      setTimeout(() => {
        map.getViewPort().resize();
      }, 300);
    }
  }
  mapToggleBtn.addEventListener("click", toggleMap);
  // Initialize UI elements first
  const searchBtn = document.getElementById("searchBtn");
  const getDirectionsBtn = document.getElementById("getDirectionsBtn");
  // Show map when searching or getting directions
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      handleSearch();
    });
  }
  if (getDirectionsBtn) {
    getDirectionsBtn.addEventListener("click", function () {
      ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
      showRoute();
    });
  }
  function initializeMap() {
    if (!map) {
      const engineType = H.Map.EngineType["HARP"];
      defaultLayers = platform.createDefaultLayers({
        engineType: engineType,
      });
      let mapContainer = document.querySelector(".map-container");
      map = new H.Map(mapContainer, defaultLayers.raster.normal.map, {
        engineType: engineType,
        zoom: 12,
        center: { lat: 40.7128, lng: -74.006 },
        pixelRatio: window.devicePixelRatio || 1,
      });
      behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      ui = H.ui.UI.createDefault(map, defaultLayers);
      window.addEventListener("resize", () => map.getViewPort().resize());
    }
    return map;
  }
  // Remove this line since we already initialized the map
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
  const faqToggles = document.querySelectorAll(".faq-toggle");
  faqToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const content = this.nextElementSibling;
      const icon = this.querySelector(".faq-icon");
      if (content.classList.contains("hidden")) {
        content.classList.remove("hidden");
        icon.classList.remove("ri-add-line");
        icon.classList.add("ri-subtract-line");
      } else {
        content.classList.add("hidden");
        icon.classList.remove("ri-subtract-line");
        icon.classList.add("ri-add-line");
      }
    });
  });
  // Move these declarations to the top of DOMContentLoaded
  const directionsTab = document.getElementById("directionsTab");
  const searchTab = document.getElementById("searchTab");
  const searchInput = document.getElementById("searchInput");
  const searchResetBtn = document.getElementById("searchResetBtn");
  const startingPoint = document.getElementById("startingPoint");
  const destination = document.getElementById("destination");
  const startingPointSuggestions = document.getElementById(
    "startingPointSuggestions"
  );
  const destinationSuggestions = document.getElementById(
    "destinationSuggestions"
  );
  const resetBtn = document.getElementById("resetBtn");
  const swapBtn = document.getElementById("swapBtn");
  let debounceTimer;
  function debounce(func, wait) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, wait);
  }
  async function fetchSuggestions(query, suggestionBox, input) {
    if (!query.trim()) {
      suggestionBox.classList.add("hidden");
      return;
    }
    try {
      const url = `https://quickdirections.ai/backend/api/map/suggest`;
      const params = {
        query: query
      };
      
      const data = await cachedFetch(url, { params });
      
      if (data && data.length > 0) {
        suggestionBox.innerHTML = data
          .map(
            (item) => `
    <button class="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50" data-lat="${item.position.lat}" data-lng="${item.position.lng}">
    <div class="flex items-center">
    <i class="ri-map-pin-line text-gray-400 mr-2"></i>
    <div>
    <div class="text-sm text-gray-900">${item.title}</div>
    <div class="text-xs text-gray-500">${item.address.label}</div>
    </div>
    </div>
    </button>
    `
          )
          .join("");
        suggestionBox.classList.remove("hidden");
        suggestionBox.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", () => {
            const title = button.querySelector(".text-gray-900").textContent;
            input.value = title;
            input.dataset.lat = button.dataset.lat;
            input.dataset.lng = button.dataset.lng;
            suggestionBox.classList.add("hidden");
          });
        });
      } else {
        suggestionBox.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      suggestionBox.classList.add("hidden");
    }
  }
  async function fetchSuggestions(query, suggestionBox, input) {
    if (!query.trim()) {
      suggestionBox.classList.add("hidden");
      return;
    }
    try {
      const url = `https://quickdirections.ai/backend/api/map/suggest`;
      const params = {
        query: query
      };
      
      const data = await cachedFetch(url, { params });
      
      if (data && data.length > 0) {
        suggestionBox.innerHTML = data
          .map(
            (item) => `
    <button class="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50" data-lat="${item.position.lat}" data-lng="${item.position.lng}">
    <div class="flex items-center">
    <i class="ri-map-pin-line text-gray-400 mr-2"></i>
    <div>
    <div class="text-sm text-gray-900">${item.title}</div>
    <div class="text-xs text-gray-500">${item.address.label}</div>
    </div>
    </div>
    </button>
    `
          )
          .join("");
        suggestionBox.classList.remove("hidden");
        suggestionBox.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", () => {
            const title = button.querySelector(".text-gray-900").textContent;
            input.value = title;
            input.dataset.lat = button.dataset.lat;
            input.dataset.lng = button.dataset.lng;
            suggestionBox.classList.add("hidden");
          });
        });
      } else {
        suggestionBox.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      suggestionBox.classList.add("hidden");
    }
  }
  startingPoint.addEventListener("input", () => {
    debounce(
      () =>
        fetchSuggestions(
          startingPoint.value,
          startingPointSuggestions,
          startingPoint
        ),
      300
    );
  });
  destination.addEventListener("input", () => {
    debounce(
      () =>
        fetchSuggestions(
          destination.value,
          destinationSuggestions,
          destination
        ),
      300
    );
  });
  document.addEventListener("click", (e) => {
    if (
      !startingPoint.contains(e.target) &&
      !startingPointSuggestions.contains(e.target)
    ) {
      startingPointSuggestions.classList.add("hidden");
    }
    if (
      !destination.contains(e.target) &&
      !destinationSuggestions.contains(e.target)
    ) {
      destinationSuggestions.classList.add("hidden");
    }
  });
  swapBtn.addEventListener("click", function () {
    const tempValue = startingPoint.value;
    const tempLat = startingPoint.dataset.lat;
    const tempLng = startingPoint.dataset.lng;
    startingPoint.value = destination.value;
    startingPoint.dataset.lat = destination.dataset.lat;
    startingPoint.dataset.lng = destination.dataset.lng;
    destination.value = tempValue;
    destination.dataset.lat = tempLat;
    destination.dataset.lng = tempLng;
  });
  const directionsResults = document.getElementById("directionsResults");
  function showRoute() {
    if (!startingPoint.value || !destination.value) {
      const notification = document.createElement("div");
      notification.className =
        "fixed top-[100px] z-50 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
      notification.innerHTML =
        "Please enter both starting point and destination";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 30000);
      return;
    }
    let geocodingService = platform.getSearchService();
    Promise.all([
      new Promise((resolve, reject) => {
        geocodingService.geocode(
          {
            q: startingPoint.value,
          },
          resolve,
          reject
        );
      }),
      new Promise((resolve, reject) => {
        geocodingService.geocode(
          {
            q: destination.value,
          },
          resolve,
          reject
        );
      }),
    ])
      .then(([startResults, endResults]) => {
        let startPoint = startResults.items[0].position;
        let endPoint = endResults.items[0].position;
        let routingService = platform.getRoutingService(null, 8);
        routingService.calculateRoute(
          {
            routingType: "fast",
            transportMode: selectedMode,
            origin: `${startPoint.lat},${startPoint.lng}`,
            destination: `${endPoint.lat},${endPoint.lng}`,
            return: "polyline,summary",
          },
          (result) => {
            let route = result.routes[0];
            let lineString = H.geo.LineString.fromFlexiblePolyline(
              route.sections[0].polyline
            );
            map.removeObjects(map.getObjects());
            let routeLine = new H.map.Polyline(lineString, {
              style: { strokeColor: "#1A6AF4", lineWidth: 5 },
            });
            let startMarker = new H.map.Marker(startPoint);
            let endMarker = new H.map.Marker(endPoint);
            
            // Create popups for route markers
            const startPopup = createMarkerPopup("Starting Point", startingPoint.value);
            const endPopup = createMarkerPopup("Destination", destination.value);
            
            addMarkerClickEvent(startMarker, startPopup);
            addMarkerClickEvent(endMarker, endPopup);
            
            map.addObjects([routeLine, startMarker, endMarker]);
            map.getViewModel().setLookAtData({
              bounds: routeLine.getBoundingBox(),
              padding: { top: 50, right: 50, bottom: 50, left: 50 },
            });
            directionsResults.classList.remove("hidden");
          },
          alert
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  function resetAll() {
    startingPoint.value = "";
    destination.value = "";
    startingPoint.dataset.lat = "";
    startingPoint.dataset.lng = "";
    destination.dataset.lat = "";
    destination.dataset.lng = "";
    directionsResults.classList.add("hidden");
    map.removeObjects(map.getObjects());
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
  }
  getDirectionsBtn.addEventListener("click", showRoute);
  resetBtn.addEventListener("click", resetAll);
  const directionsPanel = document.getElementById("directionsPanel");
  const searchPanel = document.getElementById("searchPanel");
  const locationDetailsContainer = document.createElement("div");
  locationDetailsContainer.className =
    "mt-6 p-4 bg-white border border-gray-200 rounded-lg hidden";
  searchPanel.appendChild(locationDetailsContainer);
  directionsTab.addEventListener("click", function () {
    directionsTab.classList.add("tab-active");
    searchTab.classList.remove("tab-active");
    searchTab.classList.add("text-gray-500");
    directionsPanel.classList.remove("hidden");
    searchPanel.classList.add("hidden");
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
  });
  searchTab.addEventListener("click", function () {
    searchTab.classList.add("tab-active");
    searchTab.classList.remove("text-gray-500");
    directionsTab.classList.remove("tab-active");
    directionsPanel.classList.add("hidden");
    searchPanel.classList.remove("hidden");
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
  });
  let searchedLocation = "";
  let searchSuggestionsBox = document.createElement("div");
  searchSuggestionsBox.className =
    "absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto max-h-[240px] z-50 hidden";
  searchInput.parentElement.appendChild(searchSuggestionsBox);
  searchInput.addEventListener("input", () => {
    debounce(() => {
      const query = searchInput.value;
      if (!query.trim()) {
        searchSuggestionsBox.classList.add("hidden");
        return;
      }
      const url = `https://quickdirections.ai/backend/api/map/suggest`;
      const params = { query: query };
      
      cachedFetch(url, { params })
        .then((data) => {
          if (data && data.length > 0) {
            searchSuggestionsBox.innerHTML = data
              .map(
                (item) => `
    <button class="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50" data-lat="${item.position.lat}" data-lng="${item.position.lng}">
    <div class="flex items-center">
    <i class="ri-map-pin-line text-gray-400 mr-2"></i>
    <div>
    <div class="text-sm text-gray-900">${item.title}</div>
    <div class="text-xs text-gray-500">${item.address.label}</div>
    </div>
    </div>
    </button>
    `
              )
              .join("");
            searchSuggestionsBox.classList.remove("hidden");
            searchSuggestionsBox
              .querySelectorAll("button")
              .forEach((button) => {
                button.addEventListener("click", async () => {
                  const title =
                    button.querySelector(".text-gray-900").textContent;
                  const address =
                    button.querySelector(".text-gray-500").textContent;
                  const lat = button.dataset.lat;
                  const lng = button.dataset.lng;
                  searchInput.value = title;
                  searchInput.dataset.lat = lat;
                  searchInput.dataset.lng = lng;
                  searchSuggestionsBox.classList.add("hidden");
                  const position = {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                  };
                  map.removeObjects(map.getObjects());
                  const marker = new H.map.Marker(position);
                  
                  // Create initial popup for the marker
                  const popup = createMarkerPopup(title, address, null, []);
                  addMarkerClickEvent(marker, popup);
                  
                  map.addObject(marker);
                  map.setCenter(position);
                  map.setZoom(15);
                  searchedLocation = searchInput.value;
                  try {
                    handleMapToggle();
                    const poiUrl = `https://quickdirections.ai/backend/api/map/poi`;
                    const poiParams = {
                      lat: lat,
                      lng: lng,
                      query: title
                    };
                    const poiData = await cachedFetch(poiUrl, { params: poiParams });
                    const poiDetails = poiData.items[0];
                    const phoneNumber =
                      poiDetails?.contacts?.[0]?.phone?.[0]?.value;
                    const websites = poiDetails?.contacts?.[0]?.www || [];
                    
                    // Update popup with POI details
                    const updatedPopup = createMarkerPopup(title, address, phoneNumber, websites);
                    addMarkerClickEvent(marker, updatedPopup);
                    locationDetailsContainer.innerHTML = `
    <div class="flex items-start gap-4">
    <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-primary/10 rounded-lg">
    <i class="ri-map-pin-2-line text-primary text-xl"></i>
    </div>
    <div class="flex-1">
    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
    <p class="text-gray-600 mt-1">${address}</p>
    ${
      phoneNumber
        ? `
    <div class="flex items-center gap-2 mt-2">
    <i class="ri-phone-line text-gray-400"></i>
    <a href="tel:${phoneNumber}" class="text-sm text-gray-600 hover:text-primary">${phoneNumber}</a>
    </div>
    `
        : ""
    }
    ${websites
      .map(
        (site) => `
    <div class="flex items-center gap-2 mt-1">
    <i class="ri-global-line text-gray-400"></i>
    <a href="${site.value}" target="_blank" class="text-sm text-gray-600 hover:text-primary">${site.value}</a>
    </div>
    `
      )
      .join("")}
    </div>
    </div>`;
                    locationDetailsContainer.classList.remove("hidden");
                  } catch (error) {
                    console.error("Error fetching POI details:", error);
                  }
                });
              });
          } else {
            searchSuggestionsBox.classList.add("hidden");
          }
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
          searchSuggestionsBox.classList.add("hidden");
        });
    }, 300);
  });
  document.addEventListener("click", (e) => {
    if (
      !searchInput.contains(e.target) &&
      !searchSuggestionsBox.contains(e.target)
    ) {
      searchSuggestionsBox.classList.add("hidden");
    }
  });
  async function handleSearch() {
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
    if (!searchInput.value.trim()) {
      const notification = document.createElement("div");
      notification.className =
        "fixed top-[100px] z-50 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
      notification.innerHTML = "Please enter a location to search";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }
    handleMapToggle();
    if (map && map.getViewPort) {
      setTimeout(() => {
        map.getViewPort().resize();
      }, 300);
    }
    try {
      const url = `https://quickdirections.ai/backend/api/map/suggest`;
      const params = { query: searchInput.value };
      const data = await cachedFetch(url, { params });
      if (data && data.length > 0) {
        const firstResult = data[0];
        searchInput.value = firstResult.title;
        searchInput.dataset.lat = firstResult.position.lat;
        searchInput.dataset.lng = firstResult.position.lng;
        const position = {
          lat: parseFloat(firstResult.position.lat),
          lng: parseFloat(firstResult.position.lng),
        };
        map.removeObjects(map.getObjects());
        const marker = new H.map.Marker(position);
        
        // Create initial popup for the marker
        const popup = createMarkerPopup(firstResult.title, firstResult.address.label, null, []);
        addMarkerClickEvent(marker, popup);
        
        map.addObject(marker);
        map.setCenter(position);
        map.setZoom(15);
        searchedLocation = searchInput.value;
        const poiUrl = `https://quickdirections.ai/backend/api/map/poi`;
        const poiParams = {
          lat: position.lat,
          lng: position.lng,
          query: firstResult.title
        };
        const poiData = await cachedFetch(poiUrl, { params: poiParams });
        const poiDetails = poiData.items[0];
        const phoneNumber = poiDetails?.contacts?.[0]?.phone?.[0]?.value;
        const websites = poiDetails?.contacts?.[0]?.www || [];
        
        // Update popup with POI details
        const updatedPopup = createMarkerPopup(firstResult.title, firstResult.address.label, phoneNumber, websites);
        addMarkerClickEvent(marker, updatedPopup);
        locationDetailsContainer.innerHTML = `
    <div class="flex items-start gap-4">
    <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-primary/10 rounded-lg">
    <i class="ri-map-pin-2-line text-primary text-xl"></i>
    </div>
    <div class="flex-1">
    <h3 class="text-lg font-semibold text-gray-900">${firstResult.title}</h3>
    <p class="text-gray-600 mt-1">${firstResult.address.label}</p>
    ${
      phoneNumber
        ? `
    <div class="flex items-center gap-2 mt-2">
    <i class="ri-phone-line text-gray-400"></i>
    <a href="tel:${phoneNumber}" class="text-sm text-gray-600 hover:text-primary">${phoneNumber}</a>
    </div>
    `
        : ""
    }
    ${websites
      .map(
        (site) => `
    <div class="flex items-center gap-2 mt-1">
    <i class="ri-global-line text-gray-400"></i>
    <a href="${site.value}" target="_blank" class="text-sm text-gray-600 hover:text-primary">${site.value}</a>
    </div>
    `
      )
      .join("")}
    </div>
    </div>`;
        locationDetailsContainer.classList.remove("hidden");
      } else {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-[100px] z-50 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
        notification.innerHTML = "No results found for your search";
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      const notification = document.createElement("div");
      notification.className =
        "fixed top-[100px] z-50 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
      notification.innerHTML = "Error searching location. Please try again.";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  }
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  });
  searchResetBtn.addEventListener("click", function () {
    searchInput.value = "";
    searchInput.dataset.lat = "";
    searchInput.dataset.lng = "";
    searchedLocation = "";
    map.removeObjects(map.getObjects());
    searchSuggestionsBox.classList.add("hidden");
    locationDetailsContainer.classList.add("hidden");
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
  });
 

  // Transport mode buttons
  let selectedMode = "drive";
  const transportButtons = document.querySelectorAll(".transport-btn");
  transportButtons.forEach((button) => {
    button.addEventListener("click", function () {
      transportButtons.forEach((btn) => {
        btn.classList.remove("transport-active");
        btn.classList.add("bg-gray-100", "text-gray-700");
      });
      this.classList.add("transport-active");
      this.classList.remove("bg-gray-100", "text-gray-700");
      selectedMode = this.dataset.mode;
    });
  });
  function getEstimatedTime(distance, mode) {
    const speeds = {
      drive: 30,
      transit: 20,
      walk: 3,
      bike: 10,
    };
    return Math.round((distance / speeds[mode]) * 60);
  }
  async function showRoute() {
    if (!startingPoint.value || !destination.value) {
      const notification = document.createElement("div");
      notification.className =
        "fixed top-[100px] z-50 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
      notification.innerHTML =
        "Please enter both starting point and destination";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }
    
    handleMapToggle();
   
    if (map && map.getViewPort) {
      setTimeout(() => {
        map.getViewPort().resize();
      }, 300);
    }
    try {
      const startLat = startingPoint.dataset.lat;
      const startLng = startingPoint.dataset.lng;
      const endLat = destination.dataset.lat;
      const endLng = destination.dataset.lng;
      if (!startLat || !startLng || !endLat || !endLng) {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-[100px] z-50 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
        notification.innerHTML = "Please select locations from the suggestions";
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        return;
      }
      const travelModeMap = {
        drive: "car",
        walk: "pedestrian",
        bike: "scooter",
        transit: "bus",
      };
      const routeUrl = `https://quickdirections.ai/backend/api/map/route`;
      const routeParams = {
        lat: startLat,
        lng: startLng,
        toLat: endLat,
        toLng: endLng,
        travelMode: travelModeMap[selectedMode]
      };
      const result = await cachedFetch(routeUrl, { params: routeParams });
      if (
        !result ||
        !result.routes ||
        !result.routes[0] ||
        !result.routes[0].sections ||
        !result.routes[0].sections[0]
      ) {
        throw new Error("Invalid route data");
      }
      const route = result.routes[0];
      const section = route.sections[0];
      const lineString = new H.geo.LineString();
      if (section && section.polyline) {
        if (Array.isArray(section.polyline)) {
          section.polyline.forEach((point) => {
            if (Array.isArray(point) && point.length >= 2) {
              lineString.pushLatLngAlt(point[0], point[1], 0);
            }
          });
        } else if (typeof section.polyline === "string") {
          const points = H.geo.LineString.fromFlexiblePolyline(
            section.polyline
          ).getLatLngAltArray();
          for (let i = 0; i < points.length; i += 3) {
            lineString.pushLatLngAlt(
              points[i],
              points[i + 1],
              points[i + 2] || 0
            );
          }
        }
      } else if (
        section &&
        section.polyline &&
        typeof section.polyline === "string"
      ) {
        // Handle encoded polyline string if provided
        const points = H.geo.LineString.fromFlexiblePolyline(
          section.polyline
        ).getLatLngAltArray();
        for (let i = 0; i < points.length; i += 3) {
          lineString.pushLatLngAlt(
            points[i],
            points[i + 1],
            points[i + 2] || 0
          );
        }
      } else {
        throw new Error("Invalid or missing polyline data");
      }
      map.removeObjects(map.getObjects());
      const routeLine = new H.map.Polyline(lineString, {
        style: { strokeColor: "#1A6AF4", lineWidth: 5 },
      });
      const startMarker = new H.map.Marker({
        lat: parseFloat(startLat),
        lng: parseFloat(startLng),
      });
      const endMarker = new H.map.Marker({
        lat: parseFloat(endLat),
        lng: parseFloat(endLng),
      });
      
      // Create popups for route markers
      const startPopup = createMarkerPopup("Starting Point", startingPoint.value);
      const endPopup = createMarkerPopup("Destination", destination.value);
      
      addMarkerClickEvent(startMarker, startPopup);
      addMarkerClickEvent(endMarker, endPopup);
      
      map.addObjects([routeLine, startMarker, endMarker]);
      map.getViewModel().setLookAtData({
        bounds: routeLine.getBoundingBox(),
        padding: { top: 50, right: 50, bottom: 50, left: 50 },
      });
      const distance = (route.sections[0].summary.length / 1000).toFixed(1);
      const duration = Math.round(route.sections[0].summary.duration / 60);
      directionsResults.innerHTML = `
    <div class="flex justify-between mb-4">
    <div>
    <div class="text-sm text-gray-500">Estimated Time</div>
    <div class="text-lg font-semibold">${duration} min</div>
    </div>
    <div class="text-right">
    <div class="text-sm text-gray-500">Distance</div>
    <div class="text-lg font-semibold">${distance} km</div>
    </div>
    </div>
    <div class="flex items-center text-sm text-gray-600 mb-4">
    <div class="w-5 h-5 flex items-center justify-center mr-2">
    <i class="ri-${
      selectedMode === "drive"
        ? "car"
        : selectedMode === "transit"
        ? "bus"
        : selectedMode === "walk"
        ? "walk"
        : "bike"
    }-line"></i>
    </div>
    Via ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
    </div>
    <div class="space-y-4">
    ${
      section &&
      section.turnByTurnActions &&
      Array.isArray(section.turnByTurnActions) &&
      section.turnByTurnActions.length > 0
        ? section.turnByTurnActions
            .map((action, index) => {
              let actionIcon = "arrow-right-up-line";
              let direction = action.direction || "";
              switch (action.action) {
                case "depart":
                  actionIcon = "arrow-right-up-line";
                  break;
                case "turn":
                  if (direction.includes("left")) {
                    actionIcon = "corner-up-left-line";
                  } else if (direction.includes("right")) {
                    actionIcon = "corner-up-right-line";
                  } else if (direction.includes("straight")) {
                    actionIcon = "arrow-up-line";
                  }
                  break;
                case "arrive":
                  actionIcon = "map-pin-2-line";
                  break;
                default:
                  actionIcon = "arrow-right-line";
              }
              let roadName =
                action.nextRoad &&
                action.nextRoad.name &&
                action.nextRoad.name[0]
                  ? action.nextRoad.name[0].value
                  : "";
              let instruction = "";
              if (action.action === "depart") {
                instruction = `Start on ${roadName}`;
              } else if (action.action === "arrive") {
                instruction = "Arrive at destination";
              } else if (action.action === "turn") {
                let directionText = "";
                if (direction.includes("left")) {
                  directionText = "left";
                } else if (direction.includes("right")) {
                  directionText = "right";
                } else if (direction.includes("straight")) {
                  directionText = "straight";
                }
                instruction = `Turn ${directionText}${
                  roadName ? " onto " + roadName : ""
                }`;
              } else {
                instruction = `${
                  action.action.charAt(0).toUpperCase() + action.action.slice(1)
                } ${roadName ? "onto " + roadName : ""}`;
              }
              return `
    <div class="direction-step pl-10 pb-2 relative">
    <div class="w-6 h-6 flex items-center justify-center bg-primary rounded-full text-white absolute left-0 top-0">
    <i class="ri-${actionIcon}"></i>
    </div>
    <div class="font-medium">${instruction}</div>
    <div class="text-sm text-gray-500 mt-1">
    ${action.length ? (action.length / 1000).toFixed(1) + " km" : ""}
    ${action.duration ? " · " + Math.round(action.duration / 60) + " min" : ""}
    </div>
    </div>`;
            })
            .join("")
        : '<div class="text-gray-500">No detailed instructions available for this route.</div>'
    }
    </div>
    `;
      directionsResults.classList.remove("hidden");
    } catch (error) {
      console.error("Error fetching route:", error);
      const notification = document.createElement("div");
      notification.className =
        "fixed top-[100px] z-50 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
      notification.innerHTML = "Error calculating route. Please try again.";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  }
});
