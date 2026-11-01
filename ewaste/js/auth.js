/**
 * EcoCycle - Authentication & User Management
 * Supports registration, login, profile view, and instant role switching (Citizen / Collector / Admin).
 */

const AuthModule = {
  init() {
    this.updateUserUI();
    this.bindEvents();
  },

  bindEvents() {
    // Role switcher dropdown or buttons
    const roleSelector = document.getElementById("roleQuickSwitch");
    if (roleSelector) {
      roleSelector.addEventListener("change", (e) => {
        this.switchRole(e.target.value);
      });
    }

    // Modal forms
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Listen for custom state changes
    window.addEventListener("ecocycle:user_changed", (e) => {
      this.updateUserUI();
    });
  },

  getCurrentUser() {
    return StorageManager.getCurrentUser();
  },

  updateUserUI() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Header updates
    const nameEl = document.getElementById("headerUserName");
    const roleBadgeEl = document.getElementById("headerUserRole");
    const pointsEl = document.getElementById("headerUserPoints");
    const avatarEl = document.getElementById("headerUserAvatar");
    const roleSelector = document.getElementById("roleQuickSwitch");

    if (nameEl) nameEl.textContent = user.name;
    if (roleBadgeEl) {
      roleBadgeEl.textContent = user.role.toUpperCase();
      roleBadgeEl.className = `badge badge-${user.role}`;
    }
    if (pointsEl) {
      pointsEl.textContent = `${user.points.toLocaleString()} pts`;
    }
    if (avatarEl) {
      avatarEl.textContent = user.avatar || user.name.slice(0, 2).toUpperCase();
    }
    if (roleSelector && roleSelector.value !== user.role) {
      roleSelector.value = user.role;
    }

    // Toggle navigation tabs based on role
    const adminTabBtn = document.getElementById("navAdminTab");
    const collectorTabBtn = document.getElementById("navCollectorTab");
    if (adminTabBtn) {
      adminTabBtn.style.display = user.role === "admin" ? "inline-flex" : "none";
    }
    if (collectorTabBtn) {
      collectorTabBtn.style.display = (user.role === "collector" || user.role === "admin") ? "inline-flex" : "none";
    }

    // Profile card updates
    const profName = document.getElementById("profileCardName");
    const profEmail = document.getElementById("profileCardEmail");
    const profPhone = document.getElementById("profileCardPhone");
    const profTier = document.getElementById("profileCardTier");
    const profPoints = document.getElementById("profileCardPoints");

    if (profName) profName.textContent = user.name;
    if (profEmail) profEmail.textContent = user.email;
    if (profPhone) profPhone.textContent = user.phone;
    if (profTier) profTier.textContent = user.tier || "Eco Sprout";
    if (profPoints) profPoints.textContent = `${user.points.toLocaleString()} pts`;
  },

  // Instant role switch for testing and presentation
  switchRole(roleName) {
    const users = StorageManager.getUsers();
    let targetUser = users.find(u => u.role === roleName);

    if (!targetUser) {
      // create standard user for this role
      targetUser = {
        id: `u-${roleName}-${Date.now()}`,
        name: roleName === "admin" ? "Dr. Sarah Jenkins (Admin)" : roleName === "collector" ? "Vikram Singh (Collector)" : "Alex Morgan (Citizen)",
        email: `${roleName}@ecocycle.org`,
        phone: "+91 98000 00000",
        role: roleName,
        points: roleName === "admin" ? 9999 : roleName === "collector" ? 3400 : 1250,
        tier: roleName === "admin" ? "System Director" : roleName === "collector" ? "Eco Master" : "Green Guardian",
        avatar: roleName.slice(0, 2).toUpperCase()
      };
      StorageManager.updateUser(targetUser);
    }

    StorageManager.setCurrentUser(targetUser);
    App.showToast(`Switched view to: ${roleName.toUpperCase()}`, "info");

    // Automatically switch active tab if appropriate
    if (roleName === "admin") {
      App.switchTab("admin");
    } else if (roleName === "collector") {
      App.switchTab("collector");
    } else {
      App.switchTab("dashboard");
    }
  },

  handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const role = document.getElementById("loginRole").value;

    const users = StorageManager.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create user on the fly for ease of demo
      user = {
        id: `u-${Date.now()}`,
        name: email.split("@")[0].replace(".", " ").toUpperCase(),
        email: email,
        phone: "+91 98111 55667",
        role: role,
        points: 250,
        tier: "Eco Sprout",
        avatar: email.slice(0, 2).toUpperCase()
      };
      StorageManager.updateUser(user);
    } else {
      user.role = role;
    }

    StorageManager.setCurrentUser(user);
    App.closeModal("authModal");
    App.showToast(`Welcome back, ${user.name}!`, "success");
  },

  handleRegister() {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const role = document.getElementById("regRole").value;
    const address = document.getElementById("regAddress") ? document.getElementById("regAddress").value.trim() : "";

    const newUser = {
      id: `u-${Date.now()}`,
      name: name,
      email: email,
      phone: phone,
      role: role,
      points: 200, // Sign up bonus
      tier: "Eco Sprout",
      address: address,
      avatar: name.slice(0, 2).toUpperCase()
    };

    StorageManager.updateUser(newUser);
    StorageManager.setCurrentUser(newUser);
    App.closeModal("authModal");
    App.showToast(`Account created! Welcome bonus +200 EcoPoints added.`, "success");
  }
};

if (typeof window !== "undefined") {
  window.AuthModule = AuthModule;
}
