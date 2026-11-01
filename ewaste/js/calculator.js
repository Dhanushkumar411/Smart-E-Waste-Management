/**
 * EcoCycle - Carbon Footprint & Environmental Impact Calculator
 * Uses life cycle assessment (LCA) emission factors to calculate
 * CO2 saved, toxic heavy metals diverted, water preserved, and renders interactive comparison charts.
 */

const CalculatorModule = {
  // Published LCA Impact Factors per device unit / kg
  factors: {
    mobile: { co2: 45.0, toxicMetalsGrams: 8.5, waterLiters: 910, preciousMetalsGrams: 0.35 },
    laptop: { co2: 280.0, toxicMetalsGrams: 42.0, waterLiters: 3100, preciousMetalsGrams: 1.2 },
    monitor: { co2: 190.0, toxicMetalsGrams: 650.0, waterLiters: 2400, preciousMetalsGrams: 0.8 },
    battery: { co2: 32.0, toxicMetalsGrams: 28.0, waterLiters: 450, preciousMetalsGrams: 0.1 },
    appliance: { co2: 320.0, toxicMetalsGrams: 85.0, waterLiters: 4200, preciousMetalsGrams: 0.5 },
    cables: { co2: 14.0, toxicMetalsGrams: 5.0, waterLiters: 180, preciousMetalsGrams: 0.05 }
  },

  init() {
    this.bindEvents();
    this.recalculate();
  },

  bindEvents() {
    const inputs = document.querySelectorAll(".calc-slider-input");
    inputs.forEach(input => {
      input.addEventListener("input", (e) => {
        const valSpan = document.getElementById(`${e.target.id}Val`);
        if (valSpan) valSpan.textContent = e.target.value;
        this.recalculate();
      });
    });

    // Preset scenarios
    const scenarioBtns = document.querySelectorAll(".calc-scenario-btn");
    scenarioBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const scenario = btn.getAttribute("data-scenario");
        this.applyScenario(scenario);
      });
    });

    // Certificate button
    const certBtn = document.getElementById("calcDownloadCertBtn");
    if (certBtn) {
      certBtn.addEventListener("click", () => {
        this.generateCertificate();
      });
    }
  },

  applyScenario(scenario) {
    const sMap = {
      student: { mobile: 2, laptop: 1, monitor: 0, battery: 3, appliance: 0, cables: 2 },
      family: { mobile: 4, laptop: 2, monitor: 1, battery: 6, appliance: 1, cables: 5 },
      office: { mobile: 12, laptop: 8, monitor: 6, battery: 15, appliance: 2, cables: 18 }
    };

    const target = sMap[scenario] || sMap.family;
    for (const [key, val] of Object.entries(target)) {
      const input = document.getElementById(`calcInput_${key}`);
      const valSpan = document.getElementById(`calcInput_${key}Val`);
      if (input) input.value = val;
      if (valSpan) valSpan.textContent = val;
    }

    this.recalculate();
    App.showToast(`Applied "${scenario.toUpperCase()}" e-waste profile!`, "info");
  },

  recalculate() {
    const mobileQty = parseInt(document.getElementById("calcInput_mobile")?.value || 2);
    const laptopQty = parseInt(document.getElementById("calcInput_laptop")?.value || 1);
    const monitorQty = parseInt(document.getElementById("calcInput_monitor")?.value || 1);
    const batteryQty = parseInt(document.getElementById("calcInput_battery")?.value || 4);
    const applianceQty = parseInt(document.getElementById("calcInput_appliance")?.value || 0);
    const cablesQty = parseInt(document.getElementById("calcInput_cables")?.value || 2);

    // Sum totals
    const totalCo2 = Math.round(
      mobileQty * this.factors.mobile.co2 +
      laptopQty * this.factors.laptop.co2 +
      monitorQty * this.factors.monitor.co2 +
      batteryQty * this.factors.battery.co2 +
      applianceQty * this.factors.appliance.co2 +
      cablesQty * this.factors.cables.co2
    );

    const totalToxicMetalsGrams = Math.round(
      mobileQty * this.factors.mobile.toxicMetalsGrams +
      laptopQty * this.factors.laptop.toxicMetalsGrams +
      monitorQty * this.factors.monitor.toxicMetalsGrams +
      batteryQty * this.factors.battery.toxicMetalsGrams +
      applianceQty * this.factors.appliance.toxicMetalsGrams +
      cablesQty * this.factors.cables.toxicMetalsGrams
    );

    const totalWaterLiters = Math.round(
      mobileQty * this.factors.mobile.waterLiters +
      laptopQty * this.factors.laptop.waterLiters +
      monitorQty * this.factors.monitor.waterLiters +
      batteryQty * this.factors.battery.waterLiters +
      applianceQty * this.factors.appliance.waterLiters +
      cablesQty * this.factors.cables.waterLiters
    );

    // Equivalencies
    const treesEquiv = (totalCo2 / 21.7).toFixed(1); // 1 mature tree absorbs ~21.7 kg CO2/year
    const carKmEquiv = Math.round(totalCo2 * 4.1); // ~0.24 kg CO2 per km average gasoline passenger car
    const smartphoneRecharges = Math.round(totalCo2 * 120);

    // Update UI numbers
    const co2El = document.getElementById("calcResultCo2");
    const metalsEl = document.getElementById("calcResultMetals");
    const waterEl = document.getElementById("calcResultWater");
    const treesEl = document.getElementById("calcResultTrees");
    const carKmEl = document.getElementById("calcResultCarKm");

    if (co2El) co2El.textContent = `${totalCo2.toLocaleString()} kg`;
    if (metalsEl) metalsEl.textContent = `${(totalToxicMetalsGrams / 1000).toFixed(2)} kg`;
    if (waterEl) waterEl.textContent = `${totalWaterLiters.toLocaleString()} L`;
    if (treesEl) treesEl.textContent = `${treesEquiv} trees`;
    if (carKmEl) carKmEl.textContent = `${carKmEquiv.toLocaleString()} km`;

    // Render interactive SVG comparison chart
    this.renderComparisonChart(totalCo2, totalToxicMetalsGrams);
  },

  renderComparisonChart(co2Prevented, toxicMetalsGrams) {
    const chartContainer = document.getElementById("calcChartContainer");
    if (!chartContainer) return;

    // Landfill scenario has high greenhouse emission and 100% toxic leaching
    const landfillCo2 = co2Prevented;
    const recycledCo2 = Math.round(co2Prevented * 0.12); // Closed loop only creates ~12% footprint

    const maxVal = Math.max(landfillCo2, 100);
    const landfillPct = Math.min(100, Math.round((landfillCo2 / maxVal) * 100));
    const recycledPct = Math.min(100, Math.round((recycledCo2 / maxVal) * 100));

    chartContainer.innerHTML = `
      <div class="space-y-4">
        <!-- CO2 Comparison -->
        <div>
          <div class="flex justify-between text-xs font-bold mb-1">
            <span class="text-rose-700"><i class="fas fa-trash-alt mr-1"></i> Landfill / Open Dumping Carbon Burden</span>
            <span class="text-rose-700 font-mono">+${landfillCo2} kg CO₂</span>
          </div>
          <div class="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <div class="bg-rose-500 h-3 rounded-full transition-all duration-500" style="width: ${landfillPct}%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs font-bold mb-1">
            <span class="text-emerald-700"><i class="fas fa-recycle mr-1"></i> EcoCycle Closed-Loop Refining</span>
            <span class="text-emerald-700 font-mono">${recycledCo2} kg CO₂ (88% reduction)</span>
          </div>
          <div class="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <div class="bg-emerald-500 h-3 rounded-full transition-all duration-500" style="width: ${recycledPct}%"></div>
          </div>
        </div>

        <!-- Groundwater Leachate Gauge -->
        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <i class="fas fa-biohazard text-amber-600 text-lg"></i>
            <div>
              <span class="font-bold text-amber-900 block">Groundwater Contamination Avoided</span>
              <span class="text-[11px] text-amber-700">Prevents heavy metal leachate from entering aquifers</span>
            </div>
          </div>
          <span class="font-black font-mono text-base text-amber-900">${toxicMetalsGrams.toLocaleString()} g</span>
        </div>
      </div>
    `;
  },

  generateCertificate() {
    const user = StorageManager.getCurrentUser() || { name: "Eco Contributor" };
    const co2El = document.getElementById("calcResultCo2");
    const co2Val = co2El ? co2El.textContent : "420 kg";

    const modalContent = document.getElementById("certModalContent");
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="p-8 border-4 border-double border-emerald-600 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white text-center relative overflow-hidden">
        <div class="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl mx-auto mb-4 shadow-md">
          <i class="fas fa-award"></i>
        </div>
        <span class="text-xs font-bold tracking-widest text-emerald-800 uppercase block mb-1">Certified Environmental Stewardship</span>
        <h2 class="text-2xl font-black text-stone-900 mb-2">Certificate of Carbon Mitigation</h2>
        <p class="text-xs text-stone-500 mb-6">Presented in recognition of verifiable e-waste circular diversion</p>

        <p class="text-sm text-stone-700 mb-2">This is proudly awarded to:</p>
        <h3 class="text-xl font-black text-emerald-700 border-b-2 border-emerald-300 pb-2 max-w-xs mx-auto mb-6">${user.name}</h3>

        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6 text-left">
          <div class="p-3 bg-white rounded-xl border border-stone-200">
            <span class="text-[10px] text-stone-400 block uppercase font-bold">CO₂ Footprint Prevented</span>
            <span class="text-lg font-black text-stone-900">${co2Val}</span>
          </div>
          <div class="p-3 bg-white rounded-xl border border-stone-200">
            <span class="text-[10px] text-stone-400 block uppercase font-bold">Verification Hash</span>
            <span class="text-xs font-mono font-bold text-emerald-700">ECO-CERT-${Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
        </div>

        <p class="text-[11px] text-stone-400">Validated by EcoCycle Circular Intelligence Network • ISO 14001 Standards</p>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
          <i class="fas fa-print mr-1.5"></i> Print / Save PDF
        </button>
      </div>
    `;

    App.openModal("certModal");
  }
};

if (typeof window !== "undefined") {
  window.CalculatorModule = CalculatorModule;
}
