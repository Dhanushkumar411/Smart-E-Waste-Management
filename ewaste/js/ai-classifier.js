/**
 * EcoCycle - AI E-Waste Identification & Classification Module
 * Simulates an advanced Deep Learning computer vision model (ResNet/MobileNet style)
 * with visual feature scanning, hazardous material detection, and disposal advice.
 */

const AIClassifierModule = {
  // Knowledge base of recognizable e-waste items
  presets: [
    {
      id: "battery-liion",
      title: "Lithium-Ion Battery Pack / Power Bank",
      category: "battery",
      categoryLabel: "Hazardous Battery",
      confidence: 97.4,
      image: "assets/battery_sample.svg",
      hazardousMaterials: [
        { name: "Lithium & Cobalt", severity: "High", risk: "Highly flammable; undergoes violent thermal runaway when punctured" },
        { name: "Organic Liquid Electrolytes", severity: "High", risk: "Forms hydrofluoric acid if leaked and combined with moisture" },
        { name: "Nickel & Manganese", severity: "Moderate", risk: "Bioaccumulative environmental heavy metals" }
      ],
      preciousMetals: ["Cobalt (30%)", "Nickel (15%)", "Copper foil (10%)"],
      safeDisposalAdvice: [
        "DO NOT dispose of in general household or recycling bins.",
        "Insulate terminals with electrical tape to prevent short-circuits.",
        "Store in a cool, non-combustible sand container if swelling or puncture is noticed.",
        "Hand over strictly to certified hydrometallurgical battery recyclers."
      ],
      recommendedAction: "Certified Neutralization & Cobalt Refining",
      estimatedPoints: 150,
      estimatedScrapValue: "₹40 - ₹120 ($0.50 - $1.50)"
    },
    {
      id: "smartphone-broken",
      title: "Smartphone with Fractured AMOLED Screen",
      category: "mobile",
      categoryLabel: "Handheld Telecom Device",
      confidence: 96.1,
      image: "assets/phone_sample.svg",
      hazardousMaterials: [
        { name: "Lead (Pb)", severity: "Moderate", risk: "Traces present in older micro-solder connections" },
        { name: "Indium Tin Oxide (ITO)", severity: "Low", risk: "Rare element used in touchscreen conductive layers" },
        { name: "Brominated Flame Retardants (BFR)", severity: "Moderate", risk: "Persistent organic pollutants in plastic casing" }
      ],
      preciousMetals: ["Gold pins (0.03g)", "Silver (0.3g)", "Palladium", "Tantalum capacitors"],
      safeDisposalAdvice: [
        "Perform a cryptographic factory reset or remote wipe to protect personal data.",
        "Eject SIM card and MicroSD storage cards before hand-off.",
        "Do not attempt to bend or hammer the phone, as the internal battery may ignite.",
        "Schedule doorstep collection via EcoCycle for maximum EcoPoints."
      ],
      recommendedAction: "Data Wipe -> Screen Refurbishment or Precious Metal Extraction",
      estimatedPoints: 250,
      estimatedScrapValue: "₹350 - ₹1,800 ($4.50 - $22.00)"
    },
    {
      id: "motherboard-pcb",
      title: "Multi-Layer Computer Motherboard / Printed Circuit Board",
      category: "pcb",
      categoryLabel: "High-Grade Circuitry (PCB)",
      confidence: 98.6,
      image: "assets/pcb_sample.svg",
      hazardousMaterials: [
        { name: "Lead-Tin Solder", severity: "High", risk: "Neurotoxic heavy metal; toxic leachate in groundwater" },
        { name: "Beryllium Oxide", severity: "Moderate", risk: "Used in heatsink interfaces; lung irritant if crushed into dust" },
        { name: "Antimony Trioxide", severity: "Moderate", risk: "Synergistic flame retardant in epoxy substrates" }
      ],
      preciousMetals: ["24k Gold edge fingers", "High-purity Copper traces (200g)", "Silver traces"],
      safeDisposalAdvice: [
        "Avoid breaking or shredding without specialized industrial dust extractors.",
        "Check whether RAM and CPU can be cleanly salvaged for school lab experiments.",
        "Keep away from open flames—burning releases highly toxic dioxins and furans.",
        "Hand over to R2 certified smelting partners."
      ],
      recommendedAction: "Secondary Component Salvage -> Hydrometallurgical Gold Leaching",
      estimatedPoints: 350,
      estimatedScrapValue: "₹200 - ₹650 ($2.50 - $8.00)"
    },
    {
      id: "laptop-adapter",
      title: "Switched-Mode AC/DC Power Adapter & Cable",
      category: "cables",
      categoryLabel: "Power Electronics & Copper Cables",
      confidence: 94.2,
      image: "assets/adapter_sample.svg",
      hazardousMaterials: [
        { name: "Polyvinyl Chloride (PVC) Jacket", severity: "Moderate", risk: "Releases hydrochloric gas and dioxins if incinerated" },
        { name: "Plasticizers (Phthalates)", severity: "Low", risk: "Endocrine disruptor in cable sheathing" }
      ],
      preciousMetals: ["High-grade Electrolytic Copper Wire (99.9% purity)", "Ferrite cores"],
      safeDisposalAdvice: [
        "Never burn wire insulation in backyards—this produces black carcinogenic smoke.",
        "Bundle cords neatly using twist-ties to prevent entanglement at sorting facilities.",
        "If the adapter is functioning, consider donating to community makerspaces."
      ],
      recommendedAction: "Automated Mechanical Cable Stripping & Copper Granulation",
      estimatedPoints: 80,
      estimatedScrapValue: "₹50 - ₹120 ($0.60 - $1.50)"
    },
    {
      id: "crt-monitor",
      title: "Cathode Ray Tube (CRT) / Older Display Monitor",
      category: "monitors",
      categoryLabel: "Display Screen (CRT / CCFL)",
      confidence: 95.8,
      image: "assets/monitor_sample.svg",
      hazardousMaterials: [
        { name: "Lead Oxide Glass (1.5 - 3 kg)", severity: "Critical", risk: "Funnel glass contains massive lead shields; toxic hazard" },
        { name: "Cadmium Phosphor Coating", severity: "High", risk: "Dust inside the tube is carcinogenic and kidney-damaging" },
        { name: "Mercury Vapor (in CCFL)", severity: "Critical", risk: "Neurological poison if glass lamp is crushed" }
      ],
      preciousMetals: ["Copper deflection yoke (~1 kg)", "Electron gun metals"],
      safeDisposalAdvice: [
        "CRITICAL: Do NOT shatter the glass face or vacuum tube neck.",
        "Transport with screen facing downwards on a padded surface.",
        "Requires robotic laser cutting for separate leaded funnel and unleaded panel glass.",
        "Book an urgent heavy-pickup collector through EcoCycle."
      ],
      recommendedAction: "Regulated Specialized CRT Glass Vitrification & Yoke Recovery",
      estimatedPoints: 450,
      estimatedScrapValue: "₹150 - ₹400 ($1.80 - $5.00)"
    }
  ],

  activeItem: null,

  init() {
    this.bindEvents();
    // Load first preset by default
    this.displayResult(this.presets[1]);
  },

  bindEvents() {
    // Preset buttons
    const presetButtons = document.querySelectorAll(".ai-preset-btn");
    presetButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const presetId = btn.getAttribute("data-preset");
        this.selectPreset(presetId);
      });
    });

    // File input upload
    const fileInput = document.getElementById("aiImageUpload");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Drag and drop zone
    const dropZone = document.getElementById("aiDropZone");
    if (dropZone) {
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
      });
      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
      });
      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });
    }

    // Action button: "Book Pickup for this Item"
    const bookThisItemBtn = document.getElementById("aiBookPickupBtn");
    if (bookThisItemBtn) {
      bookThisItemBtn.addEventListener("click", () => {
        if (this.activeItem) {
          PickupModule.prefillFromAI(this.activeItem);
          App.switchTab("pickup");
          App.showToast(`Pre-filled pickup form with detected ${this.activeItem.categoryLabel}!`, "info");
        }
      });
    }
  },

  selectPreset(presetId) {
    const item = this.presets.find(p => p.id === presetId) || this.presets[0];
    this.simulateScanning(item);
  },

  handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const customImgData = e.target.result;
      
      // Determine pseudo classification based on filename or random selection
      const filename = file.name.toLowerCase();
      let matched = this.presets[1]; // default phone
      if (filename.includes("bat") || filename.includes("power")) matched = this.presets[0];
      else if (filename.includes("pcb") || filename.includes("board") || filename.includes("mother")) matched = this.presets[2];
      else if (filename.includes("wire") || filename.includes("cable") || filename.includes("charger")) matched = this.presets[3];
      else if (filename.includes("screen") || filename.includes("monitor") || filename.includes("tv")) matched = this.presets[4];
      else {
        // Pick one randomly
        const randomIdx = Math.floor(Math.random() * this.presets.length);
        matched = this.presets[randomIdx];
      }

      // Clone and attach custom image preview
      const customItem = { ...matched, userUploadedImage: customImgData, confidence: (92 + Math.random() * 7).toFixed(1) };
      this.simulateScanning(customItem);
    };
    reader.readAsDataURL(file);
  },

  simulateScanning(item) {
    const scanContainer = document.getElementById("aiScanPreviewContainer");
    const resultContainer = document.getElementById("aiResultContainer");
    const scanBeam = document.getElementById("aiScanBeam");
    const previewImg = document.getElementById("aiScanImagePreview");

    if (scanBeam) scanBeam.style.display = "block";
    if (previewImg) {
      previewImg.src = item.userUploadedImage || item.image;
    }

    // Show temporary scanning status
    const statusText = document.getElementById("aiScanStatusText");
    if (statusText) {
      statusText.textContent = "Scanning visual tensor patterns & component edges...";
      statusText.className = "text-amber-500 font-semibold animate-pulse";
    }

    setTimeout(() => {
      if (statusText) statusText.textContent = "Comparing with e-waste signature database (140,000+ items)...";
    }, 600);

    setTimeout(() => {
      if (scanBeam) scanBeam.style.display = "none";
      if (statusText) {
        statusText.textContent = `Match Found: ${item.title} (${item.confidence}%)`;
        statusText.className = "text-emerald-500 font-semibold";
      }
      this.displayResult(item);
    }, 1300);
  },

  displayResult(item) {
    this.activeItem = item;

    // Elements
    const titleEl = document.getElementById("aiDetectedTitle");
    const catEl = document.getElementById("aiDetectedCategory");
    const confEl = document.getElementById("aiConfidenceScore");
    const pointsEl = document.getElementById("aiEstimatedPoints");
    const scrapValEl = document.getElementById("aiScrapValue");
    const actionEl = document.getElementById("aiRecommendedAction");
    const hazardousListEl = document.getElementById("aiHazardousList");
    const preciousListEl = document.getElementById("aiPreciousList");
    const adviceListEl = document.getElementById("aiAdviceList");
    const previewImg = document.getElementById("aiScanImagePreview");

    if (previewImg) previewImg.src = item.userUploadedImage || item.image;
    if (titleEl) titleEl.textContent = item.title;
    if (catEl) catEl.textContent = item.categoryLabel;
    if (confEl) confEl.textContent = `${item.confidence}% Match`;
    if (pointsEl) pointsEl.textContent = `+${item.estimatedPoints} EcoPoints`;
    if (scrapValEl) scrapValEl.textContent = item.estimatedScrapValue;
    if (actionEl) actionEl.textContent = item.recommendedAction;

    // Hazardous list
    if (hazardousListEl) {
      hazardousListEl.innerHTML = item.hazardousMaterials.map(h => `
        <li class="flex items-start gap-2 p-2 rounded bg-red-50 border border-red-100 text-xs text-red-900">
          <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${h.severity === 'Critical' ? 'bg-red-600 text-white' : h.severity === 'High' ? 'bg-orange-500 text-white' : 'bg-amber-400 text-stone-900'}">
            ${h.severity}
          </span>
          <div>
            <strong>${h.name}:</strong> <span>${h.risk}</span>
          </div>
        </li>
      `).join("");
    }

    // Precious metals
    if (preciousListEl) {
      preciousListEl.innerHTML = item.preciousMetals.map(m => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
          <i class="fas fa-coins text-amber-600"></i> ${m}
        </span>
      `).join("");
    }

    // Advice list
    if (adviceListEl) {
      adviceListEl.innerHTML = item.safeDisposalAdvice.map(adv => `
        <li class="flex items-start gap-2 text-xs text-stone-700">
          <i class="fas fa-check-circle text-emerald-600 mt-0.5"></i>
          <span>${adv}</span>
        </li>
      `).join("");
    }
  }
};

if (typeof window !== "undefined") {
  window.AIClassifierModule = AIClassifierModule;
}
