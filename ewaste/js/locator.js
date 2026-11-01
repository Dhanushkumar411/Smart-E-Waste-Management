/**
 * EcoCycle - Smart Recycling Center Locator
 * Integrates Leaflet / OpenStreetMap with fallback offline map rendering,
 * distance calculation (Haversine formula), category filters, and center details modal.
 */

const LocatorModule = {
  map: null,
  markers: [],
  userLocation: { lat: 28.6139, lng: 77.2090, label: "Metro City Center" },
  activeFilter: "all",
  centers: [],

  init() {
    this.centers = StorageManager.getCenters();
    this.initMap();
    this.renderCenterList();
    this.bindEvents();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("locatorSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterAndRender(e.target.value.toLowerCase());
      });
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll(".locator-filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active", "bg-emerald-600", "text-white"));
        btn.classList.add("active", "bg-emerald-600", "text-white");
        this.activeFilter = btn.getAttribute("data-filter");
        this.filterAndRender();
      });
    });

    // Detect user location button
    const locateMeBtn = document.getElementById("locatorLocateMeBtn");
    if (locateMeBtn) {
      locateMeBtn.addEventListener("click", () => {
        this.getUserGeolocation();
      });
    }
  },

  initMap() {
    const mapContainer = document.getElementById("locatorMap");
    if (!mapContainer) return;

    // Check if Leaflet L is loaded from CDN
    if (typeof L !== "undefined") {
      try {
        this.map = L.map("locatorMap").setView([this.userLocation.lat, this.userLocation.lng], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(this.map);

        this.renderMapMarkers();
        return;
      } catch (err) {
        console.warn("Leaflet initialization failed, switching to offline fallback visualizer:", err);
      }
    }

    // Offline / Standalone Fallback: Render rich interactive SVG radar map!
    this.renderOfflineSvgMap(mapContainer);
  },

  renderMapMarkers() {
    if (!this.map || typeof L === "undefined") return;

    // Clear previous markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    // Add user marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="background:#0284c7; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 4px rgba(2,132,199,0.3);"><i class="fas fa-street-view"></i></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .bindPopup("<b>You are here</b><br>Reference location for distance calculation")
      .addTo(this.map);
    this.markers.push(userMarker);

    // Add center markers
    this.centers.forEach(center => {
      const dist = this.calculateDistance(this.userLocation.lat, this.userLocation.lng, center.lat, center.lng);
      const icon = L.divIcon({
        className: 'custom-center-marker',
        html: `<div style="background:#059669; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 4px rgba(5,150,105,0.3); font-weight:bold; font-size:12px;"><i class="fas fa-recycle"></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupContent = `
        <div style="min-width:180px; font-family:sans-serif;">
          <h4 style="margin:0 0 4px; font-size:13px; font-weight:bold; color:#0f172a;">${center.name}</h4>
          <p style="margin:0 0 6px; font-size:11px; color:#475569;">${center.address}</p>
          <div style="font-size:11px; color:#059669; font-weight:600; margin-bottom:8px;">★ ${center.rating} (${center.reviewsCount} reviews) • <strong>${dist} km</strong> away</div>
          <button onclick="LocatorModule.openCenterModal('${center.id}')" style="background:#10b981; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; width:100%;">View Full Details</button>
        </div>
      `;

      const marker = L.marker([center.lat, center.lng], { icon: icon })
        .bindPopup(popupContent)
        .addTo(this.map);
      this.markers.push(marker);
    });
  },

  renderOfflineSvgMap(container) {
    container.innerHTML = `
      <div class="relative w-full h-full min-h-[350px] bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none">
        <!-- Radar Grid Effect -->
        <svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="50%" cy="50%" r="90" stroke="#10b981" stroke-width="1" fill="none" />
          <circle cx="50%" cy="50%" r="180" stroke="#10b981" stroke-width="1" fill="none" />
          <circle cx="50%" cy="50%" r="270" stroke="#10b981" stroke-width="1" fill="none" />
        </svg>

        <div class="relative z-10 max-w-md">
          <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto mb-3 text-xl animate-pulse">
            <i class="fas fa-satellite-dish"></i>
          </div>
          <h4 class="text-white font-bold text-base mb-1">Interactive GPS Radar Active</h4>
          <p class="text-xs text-slate-300 mb-4">
            ${this.centers.length} Certified E-Waste Centers detected in your immediate municipal sector.
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            ${this.centers.map(c => `
              <button onclick="LocatorModule.openCenterModal('${c.id}')" 
                      class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 text-xs transition-colors flex items-center gap-1.5">
                <i class="fas fa-map-pin text-emerald-400"></i> ${c.name.split(" ")[0]} (${this.calculateDistance(this.userLocation.lat, this.userLocation.lng, c.lat, c.lng)} km)
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  },

  filterAndRender(searchQuery = "") {
    let filtered = [...this.centers];

    // Filter chips
    if (this.activeFilter === "govt") {
      filtered = filtered.filter(c => c.isGovtCertified);
    } else if (this.activeFilter === "cash") {
      filtered = filtered.filter(c => c.acceptsInstantCash);
    } else if (this.activeFilter === "pickup") {
      filtered = filtered.filter(c => c.providesFreePickup);
    } else if (this.activeFilter === "battery") {
      filtered = filtered.filter(c => c.acceptedCategories.includes("battery"));
    }

    // Text search query
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery) ||
        c.address.toLowerCase().includes(searchQuery) ||
        c.pincode.includes(searchQuery) ||
        c.acceptedCategories.some(cat => cat.toLowerCase().includes(searchQuery))
      );
    }

    this.renderCenterList(filtered);
  },

  renderCenterList(list = this.centers) {
    const container = document.getElementById("locatorCenterList");
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-stone-400">
          <i class="fas fa-search-location text-3xl mb-2 text-stone-300"></i>
          <p class="text-sm font-semibold">No recycling centers match your filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(c => {
      const dist = this.calculateDistance(this.userLocation.lat, this.userLocation.lng, c.lat, c.lng);
      return `
        <div class="center-card p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all mb-3 cursor-pointer"
             onclick="LocatorModule.openCenterModal('${c.id}')">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <h4 class="font-bold text-stone-900 text-sm hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                ${c.name}
                ${c.isGovtCertified ? '<span title="Government R2 Certified" class="text-emerald-600 text-xs"><i class="fas fa-shield-alt"></i></span>' : ''}
              </h4>
              <p class="text-xs text-stone-500 line-clamp-1">${c.address}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ${dist} km
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs text-stone-600 mb-2.5">
            <span class="text-amber-500 font-bold"><i class="fas fa-star mr-0.5"></i>${c.rating} <span class="text-stone-400 font-normal">(${c.reviewsCount})</span></span>
            <span><i class="far fa-clock mr-1 text-stone-400"></i>${c.hours.split(":")[0]}</span>
            ${c.providesFreePickup ? '<span class="text-emerald-600 font-medium"><i class="fas fa-truck mr-1"></i>Free Pickup</span>' : ''}
          </div>

          <div class="flex flex-wrap gap-1">
            ${c.acceptedCategories.slice(0, 4).map(cat => `
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 capitalize">
                ${cat}
              </span>
            `).join("")}
            ${c.acceptedCategories.length > 4 ? `<span class="text-[10px] text-stone-400 self-center">+${c.acceptedCategories.length - 4} more</span>` : ''}
          </div>
        </div>
      `;
    }).join("");
  },

  openCenterModal(centerId) {
    const center = this.centers.find(c => c.id === centerId);
    if (!center) return;

    const modalContent = document.getElementById("centerModalContent");
    if (!modalContent) return;

    const dist = this.calculateDistance(this.userLocation.lat, this.userLocation.lng, center.lat, center.lng);
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
    const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${this.userLocation.lat}%2C${this.userLocation.lng}%3B${center.lat}%2C${center.lng}`;

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-stone-900 flex items-center gap-2">
              ${center.name}
              ${center.isGovtCertified ? '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Govt R2 Authorized</span>' : ''}
            </h3>
            <p class="text-xs text-stone-500 mt-1">${center.address}, PIN: ${center.pincode}</p>
          </div>
          <div class="text-right">
            <span class="text-lg font-black text-emerald-600">${dist} km</span>
            <p class="text-[10px] text-stone-400 uppercase">Estimated Distance</p>
          </div>
        </div>

        <p class="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
          ${center.description}
        </p>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-2.5 rounded-lg border border-stone-200">
            <span class="text-stone-400 block mb-0.5">Operating Hours</span>
            <strong class="text-stone-800">${center.hours}</strong>
          </div>
          <div class="p-2.5 rounded-lg border border-stone-200">
            <span class="text-stone-400 block mb-0.5">Direct Helpline</span>
            <strong class="text-stone-800">${center.phone}</strong>
          </div>
        </div>

        <div>
          <h5 class="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">Accepted Electronic Waste</h5>
          <div class="flex flex-wrap gap-1.5">
            ${center.acceptedCategories.map(cat => `
              <span class="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium capitalize">
                <i class="fas fa-check text-emerald-600 mr-1 text-[10px]"></i> ${cat}
              </span>
            `).join("")}
          </div>
        </div>

        <!-- Community Reviews -->
        <div>
          <h5 class="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">Verified Recycler Reviews (${center.rating} ★)</h5>
          <div class="space-y-2">
            ${center.reviews.map(r => `
              <div class="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                <div class="flex items-center justify-between mb-1">
                  <strong class="text-stone-800">${r.user}</strong>
                  <span class="text-amber-500">${'★'.repeat(r.rating)}</span>
                </div>
                <p class="text-stone-600 text-[11px]">${r.comment}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Action Links -->
        <div class="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
          <a href="${gmapsUrl}" target="_blank" class="flex-1 text-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm">
            <i class="fas fa-directions mr-1.5"></i> Google Maps Directions
          </a>
          <a href="tel:${center.phone}" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50">
            <i class="fas fa-phone mr-1.5"></i> Call Center
          </a>
        </div>
      </div>
    `;

    App.openModal("centerDetailModal");
  },

  getUserGeolocation() {
    if (navigator.geolocation) {
      App.showToast("Detecting your location via GPS...", "info");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLocation.lat = pos.coords.latitude;
          this.userLocation.lng = pos.coords.longitude;
          if (this.map) {
            this.map.setView([this.userLocation.lat, this.userLocation.lng], 13);
            this.renderMapMarkers();
          }
          this.filterAndRender();
          App.showToast("Location updated! Centers re-sorted by proximity.", "success");
        },
        (err) => {
          App.showToast("GPS permission denied. Using Metro City Central coordinates.", "info");
        }
      );
    } else {
      App.showToast("Geolocation not supported by browser.", "warning");
    }
  }
};

if (typeof window !== "undefined") {
  window.LocatorModule = LocatorModule;
}
