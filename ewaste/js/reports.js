/**
 * EcoCycle - Illegal Dumping & Disposal Reporting Module
 * Enables citizens to report toxic e-waste burn sites, open canal dumping,
 * upload photo evidence, and track municipal enforcement status.
 */

const ReportsModule = {
  init() {
    this.renderReportsFeed();
    this.bindEvents();
  },

  bindEvents() {
    // Form submission
    const form = document.getElementById("reportDumpingForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmitReport();
      });
    }

    // Photo input
    const photoInput = document.getElementById("reportPhotoInput");
    if (photoInput) {
      photoInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const preview = document.getElementById("reportPhotoPreview");
            if (preview) {
              preview.src = ev.target.result;
              preview.style.display = "block";
            }
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Location auto-fill button
    const autoLocBtn = document.getElementById("reportAutoLocBtn");
    if (autoLocBtn) {
      autoLocBtn.addEventListener("click", () => {
        const locInput = document.getElementById("reportLocation");
        if (locInput) {
          locInput.value = "GPS: 28.5450° N, 77.2730° E (Outer Ring Industrial Belt)";
          App.showToast("Current GPS coordinates tagged to report!", "info");
        }
      });
    }

    window.addEventListener("ecocycle:reports_updated", () => {
      this.renderReportsFeed();
    });
  },

  renderReportsFeed() {
    const container = document.getElementById("dumpingReportsFeed");
    if (!container) return;

    const reports = StorageManager.getReports();
    if (reports.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-stone-400">
          <i class="fas fa-check-double text-3xl mb-2 text-emerald-400"></i>
          <p class="text-xs font-semibold">No active illegal dumping complaints reported in this area.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reports.map(r => {
      const statusMeta = this.getStatusMeta(r.status);
      return `
        <div class="p-4 rounded-xl border border-stone-200 bg-white mb-3 shadow-xs">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-mono text-xs font-bold text-stone-900">${r.id}</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold ${statusMeta.className}">
                  ${statusMeta.label}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.hazardLevel === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}">
                  ${r.hazardLevel} Hazard
                </span>
              </div>
              <p class="text-xs text-stone-500">${r.date} • Reported by ${r.reporterName}</p>
            </div>
          </div>

          <div class="mb-2">
            <p class="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
              <i class="fas fa-map-marker-alt text-rose-500"></i> ${r.location}
            </p>
            <p class="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              ${r.wasteType}
            </p>
          </div>

          ${r.adminResponse ? `
            <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
              <span class="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block mb-0.5">
                <i class="fas fa-shield-alt mr-1"></i> Enforcement Action Update
              </span>
              ${r.adminResponse}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");
  },

  handleSubmitReport() {
    const user = StorageManager.getCurrentUser() || { name: "Concerned Citizen" };
    const location = document.getElementById("reportLocation").value.trim();
    const landmark = document.getElementById("reportLandmark").value.trim();
    const hazardLevel = document.getElementById("reportHazardLevel").value;
    const wasteType = document.getElementById("reportDescription").value.trim();

    const newId = `REP-${Math.floor(400 + Math.random() * 599)}`;
    const newReport = {
      id: newId,
      reporterName: user.name,
      location: location,
      landmark: landmark,
      date: new Date().toISOString().split("T")[0],
      hazardLevel: hazardLevel,
      wasteType: wasteType,
      status: "REPORTED",
      adminResponse: "Report logged with Municipal Environmental Control Unit. Inspection slated within 24 hours.",
      imageUrl: "assets/dumping_sample.svg"
    };

    StorageManager.saveReport(newReport);
    // Award citizen bonus for reporting
    StorageManager.addPointsToCurrentUser(150, "Civic reporting of toxic dumping");

    document.getElementById("reportDumpingForm").reset();
    const preview = document.getElementById("reportPhotoPreview");
    if (preview) preview.style.display = "none";

    App.showToast(`Complaint filed (${newId})! +150 Civic EcoPoints awarded for protecting the environment.`, "success");
  },

  getStatusMeta(status) {
    switch (status) {
      case "REPORTED":
        return { label: "Under Review", className: "bg-amber-100 text-amber-800 border border-amber-200" };
      case "INSPECTION_DISPATCHED":
        return { label: "Enforcement Dispatched", className: "bg-sky-100 text-sky-800 border border-sky-200" };
      case "CLEANED_RESOLVED":
        return { label: "Site Cleaned & Resolved", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" };
      default:
        return { label: status, className: "bg-stone-100 text-stone-700" };
    }
  }
};

if (typeof window !== "undefined") {
  window.ReportsModule = ReportsModule;
}
