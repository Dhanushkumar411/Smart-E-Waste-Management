/**
 * EcoCycle - EcoPoints & Rewards Module
 * Manages user points balance, reward voucher redemption,
 * real-time leaderboard rankings, and monthly recycling challenges.
 */

const RewardsModule = {
  init() {
    this.renderRewardsCatalog();
    this.renderLeaderboard();
    this.renderChallenges();
    this.renderRedemptionHistory();
    this.bindEvents();
  },

  bindEvents() {
    window.addEventListener("ecocycle:rewards_updated", () => {
      this.renderRedemptionHistory();
      this.updateUserPointsDisplay();
    });
  },

  updateUserPointsDisplay() {
    const user = StorageManager.getCurrentUser();
    if (!user) return;

    const bannerPoints = document.getElementById("rewardsBannerPoints");
    const bannerTier = document.getElementById("rewardsBannerTier");
    const nextTierGoal = document.getElementById("rewardsNextTierGoal");
    const tierProgressBar = document.getElementById("rewardsTierProgressBar");

    if (bannerPoints) bannerPoints.textContent = user.points.toLocaleString();
    if (bannerTier) bannerTier.textContent = user.tier || "Eco Sprout";

    // Tier calculation
    let max = 3000;
    if (user.points < 1000) max = 1000;
    else if (user.points < 2000) max = 2000;
    else if (user.points < 3000) max = 3000;
    else max = user.points + 1000;

    const pct = Math.min(100, Math.round((user.points / max) * 100));
    if (tierProgressBar) tierProgressBar.style.width = `${pct}%`;
    if (nextTierGoal) nextTierGoal.textContent = `${user.points} / ${max} pts to next tier`;
  },

  renderRewardsCatalog() {
    const container = document.getElementById("rewardsCatalogGrid");
    if (!container) return;

    const user = StorageManager.getCurrentUser();
    const currentPoints = user ? user.points : 0;

    container.innerHTML = SEED_DATA.rewardsCatalog.map(reward => {
      const canAfford = currentPoints >= reward.pointsCost;
      return `
        <div class="reward-card p-5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ${reward.category}
              </span>
              <span class="text-xs font-bold text-stone-500">
                ${reward.availableCount} left
              </span>
            </div>

            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3">
              <i class="fas fa-${reward.icon}"></i>
            </div>

            <h4 class="font-bold text-stone-900 text-sm mb-1">${reward.title}</h4>
            <p class="text-xs text-stone-400 font-medium mb-2">By ${reward.brand}</p>
            <p class="text-xs text-stone-600 line-clamp-2 mb-4">${reward.description}</p>
          </div>

          <div class="pt-4 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span class="text-base font-black text-emerald-600">${reward.pointsCost}</span>
              <span class="text-xs text-stone-500 font-medium"> pts</span>
            </div>
            <button onclick="RewardsModule.redeemReward('${reward.id}')" 
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${canAfford ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}"
                    ${canAfford ? '' : 'disabled'}>
              ${canAfford ? 'Redeem Voucher' : 'Need More Pts'}
            </button>
          </div>
        </div>
      `;
    }).join("");

    this.updateUserPointsDisplay();
  },

  redeemReward(rewardId) {
    const reward = SEED_DATA.rewardsCatalog.find(r => r.id === rewardId);
    if (!reward) return;

    const user = StorageManager.getCurrentUser();
    if (!user || user.points < reward.pointsCost) {
      App.showToast("Insufficient EcoPoints balance to redeem this reward.", "warning");
      return;
    }

    if (confirm(`Confirm redemption of "${reward.title}" for ${reward.pointsCost} EcoPoints?`)) {
      const success = StorageManager.deductPointsFromCurrentUser(reward.pointsCost);
      if (success) {
        const redemptionCode = `ECO-${reward.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const record = {
          id: `RED-${Date.now().toString().slice(-4)}`,
          rewardId: reward.id,
          title: reward.title,
          pointsSpent: reward.pointsCost,
          date: new Date().toISOString().split("T")[0],
          redemptionCode: redemptionCode,
          status: "Issued & Active"
        };

        StorageManager.saveRewardRedemption(record);
        this.renderRewardsCatalog();
        this.renderRedemptionHistory();

        App.showToast(`Redeemed! Your Voucher Code: ${redemptionCode}`, "success");
      }
    }
  },

  renderRedemptionHistory() {
    const container = document.getElementById("rewardsHistoryList");
    if (!container) return;

    const history = StorageManager.getRewardsHistory();
    if (history.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-stone-400 text-xs">
          No vouchers redeemed yet. Recycle devices to start claiming!
        </div>
      `;
      return;
    }

    container.innerHTML = history.map(item => `
      <div class="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-3 text-xs mb-2">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <div>
            <h5 class="font-bold text-stone-800">${item.title}</h5>
            <p class="text-[11px] text-stone-500">Claimed on ${item.date} • Spent ${item.pointsSpent} pts</p>
          </div>
        </div>
        <div class="text-right">
          <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 select-all block mb-1">
            ${item.redemptionCode}
          </span>
          <span class="text-[10px] text-stone-400 font-medium">${item.status}</span>
        </div>
      </div>
    `).join("");
  },

  renderLeaderboard() {
    const container = document.getElementById("rewardsLeaderboardList");
    if (!container) return;

    container.innerHTML = SEED_DATA.leaderboard.map(u => `
      <div class="flex items-center justify-between p-3.5 rounded-xl border border-stone-100 hover:border-emerald-300 bg-white mb-2 transition-all">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.rank === 1 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200' : u.rank === 2 ? 'bg-slate-300 text-slate-800' : u.rank === 3 ? 'bg-amber-700 text-amber-100' : 'bg-stone-100 text-stone-600'}">
            ${u.rank === 1 ? '👑' : u.rank}
          </div>
          <div>
            <h5 class="font-bold text-stone-800 text-sm flex items-center gap-1.5">
              ${u.name}
              <span class="text-[10px] px-1.5 py-0.5 rounded font-normal bg-stone-100 text-stone-600">${u.badge}</span>
            </h5>
            <p class="text-[11px] text-stone-400">${u.city} • ${u.itemsRecycled} items diverted</p>
          </div>
        </div>
        <div class="text-right">
          <span class="font-black text-emerald-600 text-sm">${u.points.toLocaleString()}</span>
          <span class="text-[11px] text-stone-500 block">EcoPoints</span>
        </div>
      </div>
    `).join("");
  },

  renderChallenges() {
    const container = document.getElementById("rewardsChallengesList");
    if (!container) return;

    container.innerHTML = SEED_DATA.monthlyChallenges.map(c => {
      const pct = Math.min(100, Math.round((c.current / c.target) * 100));
      return `
        <div class="p-4 rounded-xl border border-stone-200 bg-white mb-3">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                <i class="fas fa-${c.badgeIcon}"></i>
              </div>
              <div>
                <h5 class="font-bold text-stone-800 text-xs">${c.title}</h5>
                <p class="text-[11px] text-stone-500">${c.daysLeft} days remaining</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              +${c.bonusPoints} Bonus Pts
            </span>
          </div>

          <p class="text-xs text-stone-600 mb-2.5">${c.description}</p>

          <div>
            <div class="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <span>Progress: ${c.current} / ${c.target}</span>
              <span class="font-bold text-stone-700">${pct}%</span>
            </div>
            <div class="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }
};

if (typeof window !== "undefined") {
  window.RewardsModule = RewardsModule;
}
