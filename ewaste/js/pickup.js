/**
 * EcoCycle - Doorstep Pickup Booking & Tracking Module
 * Handles scheduling e-waste collection, instant scrap value estimation,
 * OTP verification generation, and interactive status tracking.
 */

const PickupModule = {
  activeTrackingId: null,

  init() {
    this.renderCategoryGrid();
    this.renderUserBookings();
    this.bindEvents();
    this.updateEstimator();
  },

  bindEvents() {
    // Category selection in pickup form
    const categorySelect = document.getElementById("pickupCategory");
    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        this.updateEstimator();
      });
    }

    // Weight and quantity change
    const qtyInput = document.getElementById("pickupQty");
    const weightInput = document.getElementById("pickupWeight");
    if (qtyInput) qtyInput.addEventListener("input", () => this.updateEstimator());
    if (weightInput) weightInput.addEventListener("input", () => this.updateEstimator());

    // Booking form submission
    const bookingForm = document.getElementById("pickupBookingForm");
    if (bookingForm) {
      bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleBookingSubmit();
      });
    }

    // Photo input preview
    const photoInput = document.getElementById("pickupPhotoInput");
    if (photoInput) {
      photoInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const preview = document.getElementById("pickupPhotoPreview");
            if (preview) {
              preview.src = ev.target.result;
              preview.style.display = "block";
            }
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Listen to pickup updates from other modules
    window.addEventListener("ecocycle:pickups_updated", () => {
      this.renderUserBookings();
      if (this.activeTrackingId) {
        this.renderTrackingDetails(this.activeTrackingId);
      }
    });
  },

  renderCategoryGrid() {
    const grid = document.getElementById("pickupCategoryCards");
    if (!grid) return;

    grid.innerHTML = SEED_DATA.categories.map((cat, idx) => `
      <div class="category-card p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all ${idx === 0 ? 'selected ring-2 ring-emerald-500' : ''}" 
           data-cat-id="${cat.id}">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3">
          <i class="fas fa-${cat.icon}"></i>
        </div>
        <h4 class="font-bold text-stone-800 text-sm mb-1">${cat.name}</h4>
        <p class="text-xs text-stone-500 mb-2">Avg ${cat.avgPoints} pts / item</p>
        <span class="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono">
          ${cat.hazardous.split(",")[0]}
        </span>
      </div>
    `).join("");

    // Click handler for category cards
    grid.querySelectorAll(".category-card").forEach(card => {
      card.addEventListener("click", () => {
        grid.querySelectorAll(".category-card").forEach(c => c.classList.remove("selected", "ring-2", "ring-emerald-500"));
        card.classList.add("selected", "ring-2", "ring-emerald-500");
        const catId = card.getAttribute("data-cat-id");
        const select = document.getElementById("pickupCategory");
        if (select) {
          select.value = catId;
          this.updateEstimator();
        }
      });
    });
  },

  updateEstimator() {
    const catSelect = document.getElementById("pickupCategory");
    const qtyInput = document.getElementById("pickupQty");
    const weightInput = document.getElementById("pickupWeight");
    const pointsBadge = document.getElementById("estimatorPointsBadge");
    const scrapValBadge = document.getElementById("estimatorScrapVal");
    const co2Badge = document.getElementById("estimatorCo2Badge");

    if (!catSelect) return;
    const catId = catSelect.value || "mobile";
    const catData = SEED_DATA.categories.find(c => c.id === catId) || SEED_DATA.categories[0];
    const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
    const weight = parseFloat(weightInput ? weightInput.value : 1.0) || 1.0;

    const totalPoints = Math.round(catData.avgPoints * qty + (weight * 30));
    const scrapMin = Math.round(weight * 40 + qty * 50);
    const scrapMax = Math.round(weight * 90 + qty * 180);
    const co2Saved = Math.round(catData.avgCo2 * qty + (weight * 15));

    if (pointsBadge) pointsBadge.textContent = `+${totalPoints} EcoPoints`;
    if (scrapValBadge) scrapValBadge.textContent = `₹${scrapMin} - ₹${scrapMax} ($${(scrapMin/82).toFixed(1)} - $${(scrapMax/82).toFixed(1)})`;
    if (co2Badge) co2Badge.textContent = `~${co2Saved} kg CO₂ prevented`;
  },

  prefillFromAI(aiItem) {
    const catSelect = document.getElementById("pickupCategory");
    const modelInput = document.getElementById("pickupDeviceModel");
    const conditionSelect = document.getElementById("pickupCondition");

    if (catSelect && aiItem.category) {
      catSelect.value = aiItem.category;
      // also update card selection
      const cards = document.querySelectorAll("#pickupCategoryCards .category-card");
      cards.forEach(c => {
        if (c.getAttribute("data-cat-id") === aiItem.category) {
          c.classList.add("selected", "ring-2", "ring-emerald-500");
        } else {
          c.classList.remove("selected", "ring-2", "ring-emerald-500");
        }
      });
    }

    if (modelInput) {
      modelInput.value = aiItem.title;
    }
    if (conditionSelect) {
      conditionSelect.value = "non_functional";
    }

    this.updateEstimator();
  },

  handleBookingSubmit() {
    const user = StorageManager.getCurrentUser() || {
      id: "guest",
      name: "Guest Citizen",
      phone: "+91 99999 88888",
      address: "Local City"
    };

    const category = document.getElementById("pickupCategory").value;
    const catData = SEED_DATA.categories.find(c => c.id === category) || SEED_DATA.categories[0];
    const deviceModel = document.getElementById("pickupDeviceModel").value.trim() || `${catData.name} batch`;
    const condition = document.getElementById("pickupCondition").value;
    const qty = parseInt(document.getElementById("pickupQty").value) || 1;
    const weight = parseFloat(document.getElementById("pickupWeight").value) || 1.5;
    const address = document.getElementById("pickupAddress").value.trim() || user.address || "Sector 14, Metro City";
    const pincode = document.getElementById("pickupPincode").value.trim() || "110025";
    const date = document.getElementById("pickupDate").value || new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const slot = document.getElementById("pickupSlot").value;

    const estimatedPoints = Math.round(catData.avgPoints * qty + (weight * 30));
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newId = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: newId,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone || "+91 98200 11223",
      category: category,
      categoryName: catData.name,
      deviceModel: deviceModel,
      condition: condition,
      quantity: qty,
      approxWeightKg: weight,
      address: address,
      pincode: pincode,
      preferredDate: date,
      preferredSlot: slot,
      status: "COLLECTOR_ASSIGNED", // auto assigned for interactive demo
      collectorId: "c-101",
      collectorName: "Vikram Singh (Authorized Eco-Rider)",
      collectorPhone: "+91 98711 00445",
      pickupOtp: randomOtp,
      estimatedPoints: estimatedPoints,
      createdAt: new Date().toISOString(),
      statusUpdates: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Booking Registered", note: "Pickup scheduled successfully." },
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Collector Assigned", note: "Assigned to route collector Vikram Singh." }
      ]
    };

    StorageManager.savePickup(newBooking);
    this.renderUserBookings();
    this.activeTrackingId = newBooking.id;
    this.renderTrackingDetails(newBooking.id);

    // Switch view to tracking tab
    const trackingTabBtn = document.getElementById("tabBtnTracking");
    if (trackingTabBtn) trackingTabBtn.click();

    App.showToast(`Pickup scheduled! Booking ID: ${newBooking.id}. Collector assigned.`, "success");
    document.getElementById("pickupBookingForm").reset();
    document.getElementById("pickupPhotoPreview").style.display = "none";
  },

  renderUserBookings() {
    const listContainer = document.getElementById("myBookingsList");
    if (!listContainer) return;

    const user = StorageManager.getCurrentUser();
    const allPickups = StorageManager.getPickups();
    // In citizen view show user's pickups, or all if admin/collector
    const userPickups = (user && user.role === "citizen") 
      ? allPickups.filter(p => p.userId === user.id || p.userId === "u-citizen-1")
      : allPickups;

    if (userPickups.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 text-stone-400">
          <i class="fas fa-box-open text-4xl mb-3 text-stone-300"></i>
          <p class="font-medium">No pickup requests found yet.</p>
          <p class="text-xs">Schedule your first doorstep e-waste pickup to earn EcoPoints!</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = userPickups.map(p => {
      const statusMeta = this.getStatusMeta(p.status);
      const isSelected = this.activeTrackingId === p.id;
      return `
        <div class="booking-item p-4 rounded-xl border ${isSelected ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500' : 'border-stone-200 bg-white hover:border-stone-300'} transition-all cursor-pointer mb-3"
             onclick="PickupModule.selectBookingForTracking('${p.id}')">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-stone-800">${p.id}</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${statusMeta.badgeClass}">
                ${statusMeta.label}
              </span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+${p.estimatedPoints} pts</span>
          </div>
          <h4 class="font-semibold text-stone-800 text-sm mb-1">${p.deviceModel}</h4>
          <div class="flex items-center gap-4 text-xs text-stone-500">
            <span><i class="far fa-calendar-alt mr-1"></i>${p.preferredDate}</span>
            <span><i class="fas fa-weight-hanging mr-1"></i>${p.approxWeightKg} kg</span>
            <span><i class="fas fa-map-marker-alt mr-1"></i>PIN: ${p.pincode}</span>
          </div>
        </div>
      `;
    }).join("");

    // Auto select first if none active
    if (!this.activeTrackingId && userPickups.length > 0) {
      this.selectBookingForTracking(userPickups[0].id);
    }
  },

  selectBookingForTracking(bookingId) {
    this.activeTrackingId = bookingId;
    this.renderUserBookings();
    this.renderTrackingDetails(bookingId);
  },

  renderTrackingDetails(bookingId) {
    const detailContainer = document.getElementById("trackingDetailCard");
    if (!detailContainer) return;

    const pickups = StorageManager.getPickups();
    const item = pickups.find(p => p.id === bookingId);
    if (!item) return;

    const statusSteps = [
      { key: "PENDING", title: "Booking Received", desc: "Request placed in dispatch queue" },
      { key: "COLLECTOR_ASSIGNED", title: "Collector Assigned", desc: "Driver assigned to route" },
      { key: "OUT_FOR_PICKUP", title: "Out for Pickup", desc: "Collector en route to your address" },
      { key: "COMPLETED", title: "Collected & Verified", desc: "Safe recycling and points credited" }
    ];

    const currentIdx = statusSteps.findIndex(s => s.key === item.status);
    const activeStepIndex = currentIdx === -1 ? (item.status === "COMPLETED" ? 3 : 1) : currentIdx;

    detailContainer.innerHTML = `
      <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-xl font-bold text-stone-900">${item.id}</h3>
              <span class="px-2.5 py-1 rounded text-xs font-bold ${this.getStatusMeta(item.status).badgeClass}">
                ${this.getStatusMeta(item.status).label}
              </span>
            </div>
            <p class="text-xs text-stone-500">Created: ${new Date(item.createdAt).toLocaleDateString()} at ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
            <span class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">Pickup Verification OTP</span>
            <span class="text-2xl font-black font-mono text-emerald-700 tracking-widest">${item.pickupOtp}</span>
          </div>
        </div>

        <!-- Step Progress Bar -->
        <div class="py-6">
          <div class="relative flex items-center justify-between">
            <div class="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0"></div>
            <div class="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-0 transition-all duration-500"
                 style="width: ${(activeStepIndex / (statusSteps.length - 1)) * 90}%"></div>
            
            ${statusSteps.map((step, idx) => {
              const isDone = idx <= activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              return `
                <div class="relative z-10 flex flex-col items-center text-center">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isDone ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-stone-200 text-stone-500'}">
                    ${isDone ? '<i class="fas fa-check"></i>' : idx + 1}
                  </div>
                  <span class="mt-2 text-xs font-semibold ${isCurrent ? 'text-emerald-700 font-bold' : isDone ? 'text-stone-800' : 'text-stone-400'}">
                    ${step.title}
                  </span>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Device & Pickup Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div>
            <p class="text-stone-500 mb-1">Device Details:</p>
            <p class="font-bold text-stone-800 text-sm">${item.deviceModel}</p>
            <p class="text-stone-600 mt-0.5">Category: <span class="capitalize font-medium">${item.category}</span> (${item.quantity} units, ~${item.approxWeightKg} kg)</p>
            <p class="text-stone-600">Condition: <span class="capitalize">${item.condition}</span></p>
          </div>
          <div>
            <p class="text-stone-500 mb-1">Pickup Address & Window:</p>
            <p class="font-bold text-stone-800">${item.address}, PIN: ${item.pincode}</p>
            <p class="text-stone-600 mt-0.5">Scheduled for: <span class="font-semibold text-stone-800">${item.preferredDate}</span> (${item.preferredSlot})</p>
          </div>
        </div>

        <!-- Collector Card -->
        <div class="mt-4 p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">
              <i class="fas fa-truck text-sm"></i>
            </div>
            <div>
              <p class="text-xs text-sky-800 font-medium">Assigned Eco-Rider</p>
              <h5 class="text-sm font-bold text-sky-950">${item.collectorName || "EcoCycle Dispatch Hub"}</h5>
              <p class="text-xs text-sky-700">${item.collectorPhone || "+91 98765 00000"} • Electric Pickup Van</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a href="tel:${item.collectorPhone || '+919876500000'}" class="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700">
              <i class="fas fa-phone-alt mr-1"></i> Call Driver
            </a>
          </div>
        </div>

        <!-- Timeline Log -->
        <div class="mt-4">
          <h5 class="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Activity Timeline</h5>
          <div class="space-y-2 border-l-2 border-stone-200 pl-4 ml-2">
            ${(item.statusUpdates || []).map(u => `
              <div class="text-xs relative">
                <span class="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-stone-800">${u.status}</span>
                <span class="text-stone-400 ml-2">${u.time}</span>
                <p class="text-stone-600 mt-0.5">${u.note}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  },

  getStatusMeta(status) {
    switch (status) {
      case "PENDING":
        return { label: "Requested", badgeClass: "bg-amber-100 text-amber-800 border border-amber-200" };
      case "COLLECTOR_ASSIGNED":
        return { label: "Collector Assigned", badgeClass: "bg-sky-100 text-sky-800 border border-sky-200" };
      case "OUT_FOR_PICKUP":
        return { label: "Out for Pickup", badgeClass: "bg-indigo-100 text-indigo-800 border border-indigo-200" };
      case "COMPLETED":
        return { label: "Recycled & Credited", badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-200" };
      case "CANCELLED":
        return { label: "Cancelled", badgeClass: "bg-rose-100 text-rose-800 border border-rose-200" };
      default:
        return { label: status, badgeClass: "bg-stone-100 text-stone-800" };
    }
  }
};

if (typeof window !== "undefined") {
  window.PickupModule = PickupModule;
}
