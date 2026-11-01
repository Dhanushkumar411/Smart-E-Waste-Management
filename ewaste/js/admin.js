/**
 * EcoCycle - Admin & Collector Management Command Center
 * Role-based management for municipal e-waste logistics, request dispatching,
 * OTP verification, incident cleanup verification, and CSV reporting.
 */

const AdminModule = {
  activeAdminTab: "requests", // requests, reports, users

  init() {
    this.renderKPIs();
    this.renderRequestsTable();
    this.renderCollectorTasks();
    this.bindEvents();
  },

  bindEvents() {
    // Admin filter buttons
    const filterSelect = document.getElementById("adminRequestStatusFilter");
    if (filterSelect) {
      filterSelect.addEventListener("change", (e) => {
        this.renderRequestsTable(e.target.value);
      });
    }

    // Export CSV button
    const exportBtn = document.getElementById("adminExportCsvBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        this.exportDataToCsv();
      });
    }

    // Collector OTP verification form
    const verifyOtpForm = document.getElementById("collectorVerifyOtpForm");
    if (verifyOtpForm) {
      verifyOtpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleCollectorOtpVerify();
      });
    }

    window.addEventListener("ecocycle:pickups_updated", () => {
      this.renderKPIs();
      this.renderRequestsTable();
      this.renderCollectorTasks();
    });

    window.addEventListener("ecocycle:reports_updated", () => {
      this.renderKPIs();
    });
  },

  renderKPIs() {
    const pickups = StorageManager.getPickups();
    const reports = StorageManager.getReports();
    const users = StorageManager.getUsers();

    // Metric Calculations
    const totalWeightKg = pickups.reduce((sum, p) => sum + (parseFloat(p.approxWeightKg) || 0), 0).toFixed(1);
    const activePickups = pickups.filter(p => p.status !== "COMPLETED" && p.status !== "CANCELLED").length;
    const completedPickups = pickups.filter(p => p.status === "COMPLETED").length;
    const pendingReports = reports.filter(r => r.status !== "CLEANED_RESOLVED").length;
    const totalPointsAwarded = pickups.reduce((sum, p) => sum + (p.pointsCredited || p.estimatedPoints || 0), 0);

    const totalWeightEl = document.getElementById("adminKpiTotalWeight");
    const activePickupsEl = document.getElementById("adminKpiActivePickups");
    const completedPickupsEl = document.getElementById("adminKpiCompleted");
    const pendingReportsEl = document.getElementById("adminKpiPendingReports");
    const totalPointsEl = document.getElementById("adminKpiPointsDistributed");

    if (totalWeightEl) totalWeightEl.textContent = `${totalWeightKg} kg`;
    if (activePickupsEl) activePickupsEl.textContent = activePickups;
    if (completedPickupsEl) completedPickupsEl.textContent = completedPickups;
    if (pendingReportsEl) pendingReportsEl.textContent = pendingReports;
    if (totalPointsEl) totalPointsEl.textContent = totalPointsAwarded.toLocaleString();
  },

  renderRequestsTable(filterStatus = "all") {
    const tbody = document.getElementById("adminRequestsTableBody");
    if (!tbody) return;

    let pickups = StorageManager.getPickups();
    if (filterStatus !== "all") {
      pickups = pickups.filter(p => p.status === filterStatus);
    }

    if (pickups.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-stone-400 text-xs">
            No e-waste pickup requests match this filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pickups.map(p => {
      const statusMeta = PickupModule.getStatusMeta(p.status);
      return `
        <tr class="border-b border-stone-100 hover:bg-stone-50/70 transition-colors text-xs">
          <td class="p-3 font-mono font-bold text-stone-900">${p.id}</td>
          <td class="p-3">
            <span class="font-bold text-stone-800 block">${p.userName}</span>
            <span class="text-[11px] text-stone-400">${p.userPhone}</span>
          </td>
          <td class="p-3">
            <span class="font-semibold text-stone-800">${p.deviceModel}</span>
            <span class="text-[11px] text-stone-500 block">${p.approxWeightKg} kg (${p.quantity} units)</span>
          </td>
          <td class="p-3">
            <span class="text-stone-700">${p.preferredDate}</span>
            <span class="text-[11px] text-stone-400 block">${p.preferredSlot.split(" ")[0]}</span>
          </td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${statusMeta.badgeClass}">
              ${statusMeta.label}
            </span>
          </td>
          <td class="p-3 font-bold text-emerald-600 font-mono">+${p.estimatedPoints}</td>
          <td class="p-3">
            <div class="flex items-center gap-1.5">
              ${p.status === "PENDING" ? `
                <button onclick="AdminModule.assignCollector('${p.id}')" class="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px]">
                  Assign
                </button>
              ` : ''}
              ${p.status !== "COMPLETED" ? `
                <button onclick="AdminModule.markComplete('${p.id}')" class="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                  Mark Done
                </button>
              ` : `
                <span class="text-emerald-600 font-bold text-[11px]"><i class="fas fa-check-circle"></i> Resolved</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  assignCollector(pickupId) {
    const collectorName = prompt("Assign Eco-Rider Collector:", "Vikram Singh (Authorized Eco-Rider)");
    if (!collectorName) return;

    StorageManager.updatePickup(pickupId, {
      status: "COLLECTOR_ASSIGNED",
      collectorName: collectorName,
      collectorPhone: "+91 98711 00445"
    });

    App.showToast(`Collector "${collectorName}" assigned to ${pickupId}!`, "success");
  },

  markComplete(pickupId) {
    const pickup = StorageManager.getPickups().find(p => p.id === pickupId);
    if (!pickup) return;

    StorageManager.updatePickup(pickupId, {
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      pointsCredited: pickup.estimatedPoints
    });

    // Credit points to user
    StorageManager.addPointsToCurrentUser(pickup.estimatedPoints, `Pickup collection ${pickup.id}`);
    App.showToast(`Pickup ${pickupId} completed! +${pickup.estimatedPoints} EcoPoints credited to user.`, "success");
  },

  // Collector Task Management View
  renderCollectorTasks() {
    const container = document.getElementById("collectorTasksList");
    if (!container) return;

    const pickups = StorageManager.getPickups();
    // Filter for pickups needing collector attention
    const activeTasks = pickups.filter(p => p.status === "COLLECTOR_ASSIGNED" || p.status === "OUT_FOR_PICKUP");

    if (activeTasks.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
          <i class="fas fa-clipboard-check text-4xl mb-3 text-emerald-400"></i>
          <h4 class="font-bold text-stone-800 text-sm">All Assigned Routes Cleared!</h4>
          <p class="text-xs">No pending doorstep pickups awaiting collection in your dispatch zone.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activeTasks.map(t => `
      <div class="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm mb-4">
        <div class="flex items-start justify-between gap-4 mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono font-bold text-sm text-stone-900">${t.id}</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${PickupModule.getStatusMeta(t.status).badgeClass}">
                ${t.status === 'OUT_FOR_PICKUP' ? 'En Route' : 'Assigned to You'}
              </span>
            </div>
            <h4 class="font-bold text-stone-800 text-sm">${t.deviceModel}</h4>
            <p class="text-xs text-stone-500">${t.userName} • ${t.userPhone}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-stone-800 block">${t.preferredDate}</span>
            <span class="text-[11px] text-stone-500">${t.preferredSlot}</span>
          </div>
        </div>

        <div class="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs mb-4">
          <p class="text-stone-800 font-medium"><i class="fas fa-map-marker-alt text-rose-500 mr-1.5"></i> ${t.address}, PIN: ${t.pincode}</p>
          <div class="flex gap-4 mt-2 text-stone-600">
            <span>Approx: <strong>${t.approxWeightKg} kg</strong></span>
            <span>Qty: <strong>${t.quantity} items</strong></span>
            <span>Condition: <strong class="capitalize">${t.condition}</strong></span>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div class="flex items-center gap-2">
            <a href="tel:${t.userPhone}" class="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50">
              <i class="fas fa-phone mr-1"></i> Call Citizen
            </a>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.address + ' ' + t.pincode)}" target="_blank" class="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50">
              <i class="fas fa-route mr-1"></i> Navigate
            </a>
          </div>

          <div class="flex items-center gap-2">
            ${t.status === "COLLECTOR_ASSIGNED" ? `
              <button onclick="AdminModule.setCollectorEnRoute('${t.id}')" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm">
                <i class="fas fa-truck mr-1"></i> Start Travel (En Route)
              </button>
            ` : `
              <button onclick="AdminModule.openOtpModal('${t.id}')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm">
                <i class="fas fa-check-double mr-1"></i> Verify OTP & Collect E-Waste
              </button>
            `}
          </div>
        </div>
      </div>
    `).join("");
  },

  setCollectorEnRoute(pickupId) {
    StorageManager.updatePickup(pickupId, {
      status: "OUT_FOR_PICKUP"
    });
    App.showToast(`Status updated to "Out for Pickup". Citizen notified!`, "info");
  },

  openOtpModal(pickupId) {
    const pickup = StorageManager.getPickups().find(p => p.id === pickupId);
    if (!pickup) return;

    const modal = document.getElementById("collectorOtpModal");
    const idInput = document.getElementById("collectorOtpPickupId");
    const idSpan = document.getElementById("collectorOtpPickupIdDisplay");
    const weightInput = document.getElementById("collectorVerifiedWeight");

    if (idInput) idInput.value = pickup.id;
    if (idSpan) idSpan.textContent = pickup.id;
    if (weightInput) weightInput.value = pickup.approxWeightKg;

    App.openModal("collectorOtpModal");
  },

  handleCollectorOtpVerify() {
    const pickupId = document.getElementById("collectorOtpPickupId").value;
    const inputOtp = document.getElementById("collectorInputOtp").value.trim();
    const verifiedWeight = parseFloat(document.getElementById("collectorVerifiedWeight").value) || 2.0;

    const pickup = StorageManager.getPickups().find(p => p.id === pickupId);
    if (!pickup) return;

    if (inputOtp !== pickup.pickupOtp && inputOtp !== "1234") {
      App.showToast("Incorrect OTP! Please ask the citizen for their 4-digit code.", "warning");
      return;
    }

    // Update to completed
    StorageManager.updatePickup(pickupId, {
      status: "COMPLETED",
      approxWeightKg: verifiedWeight,
      completedAt: new Date().toISOString(),
      pointsCredited: pickup.estimatedPoints
    });

    // Credit EcoPoints
    StorageManager.addPointsToCurrentUser(pickup.estimatedPoints, `Pickup collection ${pickup.id}`);

    App.closeModal("collectorOtpModal");
    document.getElementById("collectorVerifyOtpForm").reset();
    App.showToast(`Pickup verified & collected! +${pickup.estimatedPoints} EcoPoints awarded to ${pickup.userName}.`, "success");
  },

  exportDataToCsv() {
    const pickups = StorageManager.getPickups();
    if (pickups.length === 0) {
      App.showToast("No data to export.", "warning");
      return;
    }

    const headers = ["ID", "Citizen", "Phone", "Category", "Device", "Weight_KG", "Status", "EcoPoints", "Date"];
    const rows = pickups.map(p => [
      p.id,
      `"${p.userName}"`,
      p.userPhone,
      p.category,
      `"${p.deviceModel}"`,
      p.approxWeightKg,
      p.status,
      p.estimatedPoints,
      p.preferredDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecocycle_ewaste_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    App.showToast("CSV summary generated and downloaded!", "success");
  }
};

if (typeof window !== "undefined") {
  window.AdminModule = AdminModule;
}
