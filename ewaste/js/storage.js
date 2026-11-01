/**
 * EcoCycle - Local Storage Manager
 * Handles persistent state for users, pickups, rewards, reports, and marketplace items.
 */

const STORAGE_KEYS = {
  CURRENT_USER: "ecocycle_current_user",
  ALL_USERS: "ecocycle_users",
  PICKUPS: "ecocycle_pickups",
  MARKETPLACE: "ecocycle_marketplace",
  REWARDS_HISTORY: "ecocycle_rewards_history",
  DUMPING_REPORTS: "ecocycle_dumping_reports",
  CENTERS: "ecocycle_centers",
  CHALLENGES: "ecocycle_challenges",
  QUIZ_STATUS: "ecocycle_quiz_status"
};

const StorageManager = {
  // Initialize state with default data if fresh
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PICKUPS)) {
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(SEED_DATA.pickupRequests));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MARKETPLACE)) {
      localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(SEED_DATA.marketplaceListings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DUMPING_REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.DUMPING_REPORTS, JSON.stringify(SEED_DATA.dumpingReports));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CENTERS)) {
      localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(SEED_DATA.recyclingCenters));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHALLENGES)) {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(SEED_DATA.monthlyChallenges));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REWARDS_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.REWARDS_HISTORY, JSON.stringify([
        {
          id: "RED-109",
          rewardId: "rew-2",
          title: "Plant a Real Tree in Your Name",
          pointsSpent: 350,
          date: "2026-10-25",
          redemptionCode: "TREE-ECO-9481",
          status: "Claimed & Certificate Issued"
        }
      ]));
    }

    // Default registered users
    if (!localStorage.getItem(STORAGE_KEYS.ALL_USERS)) {
      const defaultUsers = [
        {
          id: "u-citizen-1",
          name: "Alex Morgan",
          email: "alex@ecocycle.org",
          phone: "+91 98200 11223",
          role: "citizen", // citizen, collector, admin
          points: 1250,
          tier: "Green Guardian",
          address: "Flat 402, Green Meadows, Sunrise Avenue",
          pincode: "110025",
          avatar: "AM"
        },
        {
          id: "u-collector-1",
          name: "Vikram Singh",
          email: "vikram@ecocollect.in",
          phone: "+91 98711 00445",
          role: "collector",
          points: 3400,
          tier: "Eco Master",
          vehicleNumber: "EV-VAN-9082",
          assignedZone: "Metro City South",
          avatar: "VS"
        },
        {
          id: "u-admin-1",
          name: "Dr. Sarah Jenkins",
          email: "admin@ecocycle.org",
          phone: "+91 99000 11000",
          role: "admin",
          points: 9999,
          tier: "System Director",
          avatar: "SJ"
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(defaultUsers));
    }

    // Default active user is Alex Morgan (citizen)
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      const users = this.getUsers();
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[0]));
    }
  },

  // Users
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // Also sync in ALL_USERS
    this.updateUser(user);
    window.dispatchEvent(new CustomEvent("ecocycle:user_changed", { detail: user }));
  },

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS)) || [];
    } catch (e) {
      return [];
    }
  },

  updateUser(updatedUser) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  },

  // EcoPoints manipulation
  addPointsToCurrentUser(amount, reason = "Recycling activity") {
    const user = this.getCurrentUser();
    if (!user) return 0;
    user.points = (user.points || 0) + amount;
    
    // Auto upgrade tier
    if (user.points >= 3000) user.tier = "Planet Hero";
    else if (user.points >= 2000) user.tier = "Eco Warrior";
    else if (user.points >= 1000) user.tier = "Green Guardian";
    else user.tier = "Eco Sprout";

    this.setCurrentUser(user);
    return user.points;
  },

  deductPointsFromCurrentUser(amount) {
    const user = this.getCurrentUser();
    if (!user || user.points < amount) return false;
    user.points -= amount;
    this.setCurrentUser(user);
    return true;
  },

  // Pickups
  getPickups() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PICKUPS)) || [];
    } catch (e) {
      return [];
    }
  },

  savePickup(pickup) {
    const pickups = this.getPickups();
    pickups.unshift(pickup);
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));
    window.dispatchEvent(new CustomEvent("ecocycle:pickups_updated"));
    return pickup;
  },

  updatePickup(id, updates) {
    const pickups = this.getPickups();
    const idx = pickups.findIndex(p => p.id === id);
    if (idx !== -1) {
      pickups[idx] = { ...pickups[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(pickups));
      window.dispatchEvent(new CustomEvent("ecocycle:pickups_updated"));
      return pickups[idx];
    }
    return null;
  },

  // Marketplace
  getMarketplace() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKETPLACE)) || [];
    } catch (e) {
      return [];
    }
  },

  saveMarketplaceItem(item) {
    const items = this.getMarketplace();
    items.unshift(item);
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("ecocycle:marketplace_updated"));
    return item;
  },

  // Dumping reports
  getReports() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DUMPING_REPORTS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveReport(report) {
    const reports = this.getReports();
    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.DUMPING_REPORTS, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent("ecocycle:reports_updated"));
    return report;
  },

  updateReport(id, updates) {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      reports[idx] = { ...reports[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.DUMPING_REPORTS, JSON.stringify(reports));
      window.dispatchEvent(new CustomEvent("ecocycle:reports_updated"));
      return reports[idx];
    }
    return null;
  },

  // Rewards redemption history
  getRewardsHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REWARDS_HISTORY)) || [];
    } catch (e) {
      return [];
    }
  },

  saveRewardRedemption(redemption) {
    const history = this.getRewardsHistory();
    history.unshift(redemption);
    localStorage.setItem(STORAGE_KEYS.REWARDS_HISTORY, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent("ecocycle:rewards_updated"));
    return redemption;
  },

  // Recycling centers
  getCenters() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CENTERS)) || [];
    } catch (e) {
      return [];
    }
  },

  // Reset to seed data
  resetAll() {
    localStorage.clear();
    this.init();
    window.location.reload();
  }
};

if (typeof window !== "undefined") {
  window.StorageManager = StorageManager;
}
