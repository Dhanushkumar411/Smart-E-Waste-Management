/**
 * EcoCycle - Master Application Controller
 * Handles tab navigation, modals, toasts, global metrics ticker, and lifecycle bootstrap.
 */

const App = {
  activeTab: "dashboard",

  init() {
    console.log("Initializing EcoCycle Platform...");

    // 1. Initialize persistent storage
    StorageManager.init();

    // 2. Initialize submodules
    AuthModule.init();
    PickupModule.init();
    AIClassifierModule.init();
    LocatorModule.init();
    RewardsModule.init();
    MarketplaceModule.init();
    CalculatorModule.init();
    ReportsModule.init();
    LearningModule.init();
    AdminModule.init();

    // 3. Bind global UI events
    this.bindGlobalEvents();
    this.updateHomeStats();
    this.handleUrlHash();
  },

  bindGlobalEvents() {
    // Nav tab clicks
    const navButtons = document.querySelectorAll("[data-nav-target]");
    navButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const targetTab = btn.getAttribute("data-nav-target");
        this.switchTab(targetTab);
      });
    });

    // Close modal buttons
    const closeButtons = document.querySelectorAll("[data-close-modal]");
    closeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-modal");
        this.closeModal(modalId);
      });
    });

    // Modal background overlay clicks
    const modals = document.querySelectorAll(".modal-overlay");
    modals.forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.add("hidden");
        }
      });
    });

    // Hash change routing
    window.addEventListener("hashchange", () => {
      this.handleUrlHash();
    });

    // Mobile nav toggle
    const mobileMenuBtn = document.getElementById("mobileMenuToggle");
    const mobileMenu = document.getElementById("mobileNavMenu");
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
    }

    // Role switcher dropdown
    const roleSelect = document.getElementById("roleQuickSwitch");
    if (roleSelect) {
      roleSelect.addEventListener("change", (e) => {
        AuthModule.switchRole(e.target.value);
      });
    }
  },

  handleUrlHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(`tab-${hash}`)) {
      this.switchTab(hash);
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update nav active classes
    const allNavButtons = document.querySelectorAll("[data-nav-target]");
    allNavButtons.forEach(btn => {
      if (btn.getAttribute("data-nav-target") === tabId) {
        btn.classList.add("nav-active");
      } else {
        btn.classList.remove("nav-active");
      }
    });

    // Hide all tab sections, show selected
    const allTabs = document.querySelectorAll(".app-tab-section");
    allTabs.forEach(section => {
      if (section.id === `tab-${tabId}`) {
        section.classList.remove("hidden");
        // Scroll to top of tab
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        section.classList.add("hidden");
      }
    });

    // Trigger map invalidation if locator tab opened
    if (tabId === "locator" && LocatorModule.map) {
      setTimeout(() => {
        LocatorModule.map.invalidateSize();
      }, 200);
    }

    // Close mobile nav menu if open
    const mobileMenu = document.getElementById("mobileNavMenu");
    if (mobileMenu) mobileMenu.classList.add("hidden");

    window.location.hash = `#${tabId}`;
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    const icons = {
      success: "fa-check-circle text-emerald-400",
      warning: "fa-exclamation-triangle text-amber-400",
      danger: "fa-times-circle text-rose-400",
      info: "fa-info-circle text-sky-400"
    };

    toast.className = `toast-pill flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 pointer-events-auto transform transition-all duration-300 translate-y-4 opacity-0`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info} text-base flex-shrink-0"></i>
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white ml-2 text-sm">&times;</button>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    }, 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-x-6");
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  },

  updateHomeStats() {
    const pickups = StorageManager.getPickups();
    const reports = StorageManager.getReports();

    const totalWeightKg = pickups.reduce((acc, p) => acc + (parseFloat(p.approxWeightKg) || 0), 14820);
    const co2Saved = Math.round(totalWeightKg * 22.4);

    const statWeightEl = document.getElementById("homeStatWeight");
    const statCo2El = document.getElementById("homeStatCo2");
    const statPickupsEl = document.getElementById("homeStatPickups");

    if (statWeightEl) statWeightEl.textContent = `${totalWeightKg.toLocaleString()} kg`;
    if (statCo2El) statCo2El.textContent = `${co2Saved.toLocaleString()} kg`;
    if (statPickupsEl) statPickupsEl.textContent = (4210 + pickups.length).toLocaleString();
  }
};

// Bootstrap on window load
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

if (typeof window !== "undefined") {
  window.App = App;
}
