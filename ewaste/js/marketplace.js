/**
 * EcoCycle - Second-Life Marketplace & Component Reuse (ReUseTech)
 * Facilitates peer-to-peer exchange of refurbished gadgets, donations to students,
 * and component salvage requests for repair technicians and hobbyists.
 */

const MarketplaceModule = {
  activeTab: "all", // all, sale, donate, salvage, request

  init() {
    this.renderListings();
    this.bindEvents();
  },

  bindEvents() {
    // Filter tabs
    const filterTabs = document.querySelectorAll(".mkt-tab-btn");
    filterTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        filterTabs.forEach(b => b.classList.remove("active", "bg-emerald-600", "text-white"));
        btn.classList.add("active", "bg-emerald-600", "text-white");
        this.activeTab = btn.getAttribute("data-tab");
        this.renderListings();
      });
    });

    // Search bar
    const searchInput = document.getElementById("mktSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.renderListings(e.target.value.toLowerCase());
      });
    }

    // New item form submission
    const newItemForm = document.getElementById("newListingForm");
    if (newItemForm) {
      newItemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleNewListingSubmit();
      });
    }

    window.addEventListener("ecocycle:marketplace_updated", () => {
      this.renderListings();
    });
  },

  renderListings(searchQuery = "") {
    const container = document.getElementById("marketplaceGrid");
    if (!container) return;

    let items = StorageManager.getMarketplace();

    if (this.activeTab !== "all") {
      items = items.filter(i => i.type === this.activeTab);
    }

    if (searchQuery) {
      items = items.filter(i => 
        i.title.toLowerCase().includes(searchQuery) ||
        i.specs.toLowerCase().includes(searchQuery) ||
        i.location.toLowerCase().includes(searchQuery) ||
        i.sellerRole.toLowerCase().includes(searchQuery)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-stone-400">
          <i class="fas fa-microchip text-4xl mb-3 text-stone-300"></i>
          <p class="font-bold text-stone-600">No matching electronics or components found.</p>
          <p class="text-xs">Be the first to list a spare part or refurbished gadget!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const typeBadge = this.getTypeBadge(item.type);
      return `
        <div class="listing-card p-5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeBadge.className}">
                ${typeBadge.label}
              </span>
              <span class="text-[11px] text-stone-400 font-medium">
                ${item.postedDaysAgo ? `${item.postedDaysAgo}d ago` : 'Just now'}
              </span>
            </div>

            <h4 class="font-bold text-stone-900 text-sm mb-1.5 leading-snug">${item.title}</h4>
            
            <div class="flex items-baseline gap-2 mb-3">
              <span class="text-lg font-black ${item.price === 0 ? 'text-emerald-600' : 'text-stone-900'}">
                ${item.price === 0 ? 'FREE DONATION' : `₹${item.price.toLocaleString()}`}
              </span>
              ${item.price > 0 ? `<span class="text-xs text-stone-400 font-normal">($${(item.price/82).toFixed(1)})</span>` : ''}
            </div>

            <p class="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 mb-3 leading-relaxed">
              ${item.specs}
            </p>

            <div class="space-y-1 text-xs text-stone-500 mb-4">
              <div class="flex items-center gap-1.5">
                <i class="fas fa-tag text-stone-400 text-[10px]"></i>
                <span class="font-medium text-stone-700">Condition:</span> ${item.condition}
              </div>
              <div class="flex items-center gap-1.5">
                <i class="fas fa-map-marker-alt text-stone-400 text-[10px]"></i>
                <span>${item.location}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-stone-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                ${item.sellerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p class="text-xs font-bold text-stone-800 leading-none">${item.sellerName}</p>
                <span class="text-[10px] text-emerald-600 font-medium">${item.sellerRole}</span>
              </div>
            </div>

            <button onclick="MarketplaceModule.openContactModal('${item.id}')" 
                    class="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm">
              <i class="far fa-comment-dots mr-1"></i> Connect
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  getTypeBadge(type) {
    switch (type) {
      case "sale":
        return { label: "Refurbished For Sale", className: "bg-blue-50 text-blue-700 border border-blue-200" };
      case "donate":
        return { label: "Free Donation", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
      case "salvage":
        return { label: "Reusable Components", className: "bg-purple-50 text-purple-700 border border-purple-200" };
      case "request":
        return { label: "Student / Tech Request", className: "bg-amber-50 text-amber-800 border border-amber-200" };
      default:
        return { label: type, className: "bg-stone-100 text-stone-700" };
    }
  },

  handleNewListingSubmit() {
    const user = StorageManager.getCurrentUser() || { name: "Community Member", role: "Citizen" };
    const title = document.getElementById("listingTitle").value.trim();
    const type = document.getElementById("listingType").value;
    const category = document.getElementById("listingCategory").value;
    const price = parseInt(document.getElementById("listingPrice").value) || 0;
    const condition = document.getElementById("listingCondition").value;
    const specs = document.getElementById("listingSpecs").value.trim();
    const location = document.getElementById("listingLocation").value.trim() || "Metro City";
    const phone = document.getElementById("listingPhone").value.trim() || "+91 98000 11111";

    const newItem = {
      id: `mkt-${Date.now()}`,
      title: title,
      type: type,
      category: category,
      price: type === "donate" || type === "request" ? 0 : price,
      condition: condition,
      specs: specs,
      sellerName: user.name,
      sellerRole: user.role === "citizen" ? "Eco Contributor" : user.role === "collector" ? "Tech Salvager" : "Certified Lab",
      location: location,
      phone: phone,
      postedDaysAgo: 0,
      isVerified: true
    };

    StorageManager.saveMarketplaceItem(newItem);
    App.closeModal("newListingModal");
    document.getElementById("newListingForm").reset();
    App.showToast("Your listing is now live on the ReUseTech Exchange!", "success");
  },

  openContactModal(itemId) {
    const items = StorageManager.getMarketplace();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const modalContent = document.getElementById("contactModalContent");
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <span class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Connecting With Contributor</span>
          <h4 class="font-bold text-stone-900 text-base">${item.title}</h4>
          <p class="text-xs text-stone-600 mt-1">${item.specs}</p>
        </div>

        <div class="flex items-center gap-3 p-3 rounded-xl border border-stone-200">
          <div class="w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold">
            ${item.sellerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h5 class="font-bold text-stone-900 text-sm">${item.sellerName}</h5>
            <p class="text-xs text-stone-500">${item.sellerRole} • ${item.location}</p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-stone-700 block">Your Message / Proposal</label>
          <textarea id="contactModalMessage" rows="3" class="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Hi! I am interested in this item for a student project/repair..."></textarea>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-stone-200">
          <button onclick="MarketplaceModule.sendChatMessage('${item.sellerName}')" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm">
            <i class="far fa-paper-plane mr-1.5"></i> Send Message
          </button>
          <a href="tel:${item.phone}" class="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs">
            <i class="fas fa-phone mr-1.5"></i> Call Directly
          </a>
        </div>
      </div>
    `;

    App.openModal("contactModal");
  },

  sendChatMessage(recipient) {
    const msg = document.getElementById("contactModalMessage").value.trim();
    if (!msg) {
      App.showToast("Please enter a message first.", "warning");
      return;
    }

    App.closeModal("contactModal");
    App.showToast(`Message transmitted to ${recipient}! They will respond via SMS / WhatsApp.`, "success");
  }
};

if (typeof window !== "undefined") {
  window.MarketplaceModule = MarketplaceModule;
}
