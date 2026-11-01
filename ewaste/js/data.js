/**
 * EcoCycle - Seed Data
 * Contains comprehensive initial mock data for recycling centers,
 * marketplace items, rewards, pickup requests, educational articles, and quiz.
 */

const SEED_DATA = {
  // Certified Recycling Centers (with real-world coordinates and details)
  recyclingCenters: [
    {
      id: "rc-1",
      name: "EcoGreen Circular Hub",
      address: "Plot 42, Tech Park Industrial Area, Sector 5",
      city: "Metro City",
      pincode: "110001",
      lat: 28.6139,
      lng: 77.2090,
      phone: "+91 98765 43210",
      email: "support@ecogreenhub.org",
      hours: "Mon - Sat: 9:00 AM - 6:30 PM",
      rating: 4.8,
      reviewsCount: 142,
      isGovtCertified: true,
      acceptsInstantCash: true,
      providesFreePickup: true,
      acceptedCategories: ["mobile", "laptop", "battery", "cables", "appliances", "pcb"],
      description: "State-of-the-art government authorized R2 certified dismantling & precious metal recovery center.",
      reviews: [
        { user: "Rahul Sharma", rating: 5, date: "2026-10-15", comment: "Very professional staff. Got 850 EcoPoints and instant certificate!" },
        { user: "Priya Nair", rating: 4, date: "2026-10-02", comment: "Quick drop-off for my 4 dead laptop batteries and old CRT monitor." }
      ]
    },
    {
      id: "rc-2",
      name: "UrbanMine E-Waste Solutions",
      address: "18 Circular Road, Electronics Zone",
      city: "Metro City",
      pincode: "110025",
      lat: 28.5450,
      lng: 77.2730,
      phone: "+91 98111 22334",
      email: "contact@urbanmine.in",
      hours: "Mon - Fri: 10:00 AM - 7:00 PM",
      rating: 4.6,
      reviewsCount: 98,
      isGovtCertified: true,
      acceptsInstantCash: true,
      providesFreePickup: false,
      acceptedCategories: ["mobile", "laptop", "pcb", "cables"],
      description: "Specialized in microchip extraction, PCB precious metal hydrometallurgy, and safe battery neutralization.",
      reviews: [
        { user: "Ankit Verma", rating: 5, date: "2026-09-28", comment: "Great place for students looking to hand over scrap motherboards." }
      ]
    },
    {
      id: "rc-3",
      name: "CleanEarth Battery & Tech Recovery",
      address: "74 Green Valley Logistics Center, Near Ring Road",
      city: "Metro City",
      pincode: "110048",
      lat: 28.5245,
      lng: 77.2066,
      phone: "+91 99555 77889",
      email: "helpline@cleanearth.org",
      hours: "Tue - Sun: 8:30 AM - 5:00 PM",
      rating: 4.9,
      reviewsCount: 215,
      isGovtCertified: true,
      acceptsInstantCash: false,
      providesFreePickup: true,
      acceptedCategories: ["battery", "mobile", "chargers", "monitors"],
      description: "Premier dedicated Lithium-Ion, Lead-Acid and Ni-MH battery neutralizer and safe CRT recycling facility.",
      reviews: [
        { user: "Sunita Rao", rating: 5, date: "2026-10-20", comment: "They safely accepted swollen power banks that no one else would touch." }
      ]
    },
    {
      id: "rc-4",
      name: "VoltCycle Appliance & E-Disposal",
      address: "B-12 Industrial Estate, Outer Bypass",
      city: "Metro City",
      pincode: "110085",
      lat: 28.7041,
      lng: 77.1025,
      phone: "+91 97777 88990",
      email: "dispatch@voltcycle.com",
      hours: "Daily: 9:00 AM - 8:00 PM",
      rating: 4.5,
      reviewsCount: 76,
      isGovtCertified: true,
      acceptsInstantCash: true,
      providesFreePickup: true,
      acceptedCategories: ["appliances", "monitors", "printers", "pcb"],
      description: "Heavy e-waste specialists. Automated refrigerant recovery, motor de-wiring, and heavy electronics shredding.",
      reviews: [
        { user: "David K.", rating: 4, date: "2026-08-14", comment: "Picked up my old refrigerator and broken microwave right from my apartment." }
      ]
    }
  ],

  // Pre-configured Categories
  categories: [
    { id: "mobile", name: "Smartphones & Tablets", icon: "mobile-alt", avgPoints: 250, avgCo2: 45, hazardous: "Lithium, Lead, Arsenic" },
    { id: "laptop", name: "Laptops & Desktops", icon: "laptop", avgPoints: 600, avgCo2: 280, hazardous: "Mercury backlights, Lead solder, Cadmium" },
    { id: "battery", name: "Batteries & Power Banks", icon: "battery-three-quarters", avgPoints: 150, avgCo2: 30, hazardous: "Lithium, Cobalt, Acid electrolytes" },
    { id: "cables", name: "Chargers, Adapters & Cables", icon: "plug", avgPoints: 80, avgCo2: 12, hazardous: "Brominated Flame Retardants, PVC" },
    { id: "monitors", name: "Monitors, TVs & Displays", icon: "tv", avgPoints: 450, avgCo2: 190, hazardous: "Lead glass, Phosphors, Mercury" },
    { id: "pcb", name: "Circuit Boards & Motherboards", icon: "microchip", avgPoints: 350, avgCo2: 85, hazardous: "Beryllium, Antimony, Lead" },
    { id: "appliances", name: "Home & Kitchen Appliances", icon: "blender", avgPoints: 500, avgCo2: 320, hazardous: "Ozone-depleting CFCs, PCB oils" },
    { id: "printers", name: "Printers & Office Gadgets", icon: "print", avgPoints: 300, avgCo2: 110, hazardous: "Carbon black toner, Heavy metals" }
  ],

  // Sample Pickup Requests (for user & admin tracking)
  pickupRequests: [
    {
      id: "ECO-8921",
      userId: "u-citizen-1",
      userName: "Alex Morgan",
      userPhone: "+91 98200 11223",
      category: "laptop",
      categoryName: "Laptops & Desktops",
      deviceModel: "Dell Inspiron 15 (2018) + 2 Dead Hard Drives",
      condition: "Broken screen, non-functional motherboard",
      quantity: 3,
      approxWeightKg: 4.5,
      address: "Flat 402, Green Meadows, Sunrise Avenue",
      pincode: "110025",
      preferredDate: "2026-11-02",
      preferredSlot: "Morning (9:00 AM - 12:00 PM)",
      status: "COLLECTOR_ASSIGNED", // PENDING, COLLECTOR_ASSIGNED, OUT_FOR_PICKUP, COMPLETED, CANCELLED
      collectorId: "c-101",
      collectorName: "Vikram Singh (Authorized Eco-Rider)",
      collectorPhone: "+91 98711 00445",
      pickupOtp: "4829",
      estimatedPoints: 850,
      createdAt: "2026-10-30T10:15:00Z",
      statusUpdates: [
        { time: "2026-10-30 10:15", status: "Booking Submitted", note: "Pickup request registered in system." },
        { time: "2026-10-30 14:30", status: "Collector Assigned", note: "Collector Vikram Singh assigned to your route." }
      ]
    },
    {
      id: "ECO-7814",
      userId: "u-citizen-1",
      userName: "Alex Morgan",
      userPhone: "+91 98200 11223",
      category: "mobile",
      categoryName: "Smartphones & Tablets",
      deviceModel: "Samsung Galaxy J7 + 3 USB-C Cables",
      condition: "Dead battery, swollen back cover",
      quantity: 4,
      approxWeightKg: 1.2,
      address: "Flat 402, Green Meadows, Sunrise Avenue",
      pincode: "110025",
      preferredDate: "2026-10-24",
      preferredSlot: "Afternoon (12:00 PM - 4:00 PM)",
      status: "COMPLETED",
      collectorId: "c-101",
      collectorName: "Vikram Singh",
      collectorPhone: "+91 98711 00445",
      pickupOtp: "1190",
      estimatedPoints: 420,
      pointsCredited: 420,
      createdAt: "2026-10-22T08:00:00Z",
      completedAt: "2026-10-24T15:45:00Z",
      statusUpdates: [
        { time: "2026-10-22 08:00", status: "Booking Submitted", note: "Pickup request registered." },
        { time: "2026-10-23 11:00", status: "Collector Assigned", note: "Assigned to Vikram Singh." },
        { time: "2026-10-24 13:10", status: "Out for Pickup", note: "Collector in transit." },
        { time: "2026-10-24 15:45", status: "Collected & Verified", note: "E-waste weighed and safely transferred. 420 EcoPoints added!" }
      ]
    },
    {
      id: "ECO-9034",
      userId: "u-citizen-2",
      userName: "Kavita Sen",
      userPhone: "+91 99100 88221",
      category: "monitors",
      categoryName: "Monitors, TVs & Displays",
      deviceModel: "Old Sony 24-inch CRT Monitor",
      condition: "Intact glass, heavy chassis",
      quantity: 1,
      approxWeightKg: 12.0,
      address: "House 12, Block C, Green Park",
      pincode: "110016",
      preferredDate: "2026-11-04",
      preferredSlot: "Evening (4:00 PM - 7:00 PM)",
      status: "PENDING",
      collectorId: null,
      collectorName: null,
      pickupOtp: "6312",
      estimatedPoints: 500,
      createdAt: "2026-10-31T09:20:00Z",
      statusUpdates: [
        { time: "2026-10-31 09:20", status: "Booking Submitted", note: "Awaiting collector assignment." }
      ]
    }
  ],

  // Second-Life Marketplace & Component Reuse Board
  marketplaceListings: [
    {
      id: "mkt-1",
      type: "sale", // sale, donate, request
      title: "Refurbished Lenovo ThinkPad T480 (Core i5 / 8GB RAM)",
      category: "laptop",
      price: 14500, // in INR (approx $175)
      condition: "Refurbished - 100% Working",
      specs: "New thermal paste, fresh SSD 256GB, battery holds 3.5 hrs charge. Perfect for students.",
      sellerName: "TechRevive Lab",
      sellerRole: "Certified Repair Tech",
      location: "Metro City, Sector 18",
      phone: "+91 98450 12345",
      image: "assets/laptop_sample.jpg",
      postedDaysAgo: 2,
      isVerified: true
    },
    {
      id: "mkt-2",
      type: "donate",
      title: "Free Working 19-inch LG LCD Monitor (VGA + DVI)",
      category: "monitors",
      price: 0,
      condition: "Used - Good Condition",
      specs: "Upgraded my work desk. Fully functional, no dead pixels. Free for any school child or student.",
      sellerName: "Dr. Ananya Roy",
      sellerRole: "Eco Contributor",
      location: "Metro City, South Ext",
      phone: "+91 97123 45678",
      image: "assets/monitor_sample.jpg",
      postedDaysAgo: 1,
      isVerified: true
    },
    {
      id: "mkt-3",
      type: "salvage",
      title: "Salvaged 18650 Li-ion Cells (Tested 2200mAh) x 12 pcs",
      category: "battery",
      price: 480,
      condition: "Tested Components",
      specs: "Recovered from discarded e-bike battery pack. Capacity tested, internal resistance below 45mΩ. Ideal for DIY robotics & powerwall projects.",
      sellerName: "MakerSpace Club",
      sellerRole: "Electronics Student Group",
      location: "Metro City, Tech Campus",
      phone: "+91 98234 56789",
      image: "assets/battery_sample.jpg",
      postedDaysAgo: 3,
      isVerified: true
    },
    {
      id: "mkt-4",
      type: "request",
      title: "Wanted: Broken Laptop Motherboards for SMD Soldering Practice",
      category: "pcb",
      price: 0,
      condition: "Scrap / Any Condition",
      specs: "Diploma engineering student looking for 3-5 scrapped motherboards to practice micro-soldering, BGA reballing, and trace repairs.",
      sellerName: "Rohan Patil",
      sellerRole: "Engineering Student",
      location: "Metro City, University Area",
      phone: "+91 99345 67890",
      image: "assets/pcb_sample.jpg",
      postedDaysAgo: 4,
      isVerified: false
    }
  ],

  // EcoPoints Rewards Catalog
  rewardsCatalog: [
    {
      id: "rew-1",
      title: "EcoStore ₹500 Shopping Voucher",
      brand: "GreenPlanet Store",
      pointsCost: 500,
      category: "Shopping",
      icon: "shopping-bag",
      description: "Get ₹500 flat discount on eco-friendly lifestyle products, organic gear, and refurbished gadgets.",
      availableCount: 45
    },
    {
      id: "rew-2",
      title: "Plant a Real Tree in Your Name",
      brand: "Sankalp Taru Foundation",
      pointsCost: 350,
      category: "Environment",
      icon: "seedling",
      description: "A native tree sapling will be planted, geo-tagged, and a personalized digital certificate emailed to you.",
      availableCount: 120
    },
    {
      id: "rew-3",
      title: "Free Gadget Health Check & Cleaning",
      brand: "QuickFix Care Labs",
      pointsCost: 300,
      category: "Service",
      icon: "wrench",
      description: "Professional internal dust cleanup, thermal repasting, and diagnostic scan for 1 laptop or console.",
      availableCount: 25
    },
    {
      id: "rew-4",
      title: "Amazon Gift Card ₹1,000",
      brand: "Amazon India",
      pointsCost: 1200,
      category: "Gift Card",
      icon: "gift",
      description: "Direct digital code redeemable on Amazon for any purchase. Sent instantly to registered email.",
      availableCount: 15
    },
    {
      id: "rew-5",
      title: "Biodegradable Phone Case or Cable Organizers",
      brand: "BioTech Accessories",
      pointsCost: 400,
      category: "Products",
      icon: "leaf",
      description: "100% plant-based wheat straw phone case or premium organic hemp cable organizer pouch.",
      availableCount: 60
    }
  ],

  // Top Recyclers Leaderboard
  leaderboard: [
    { rank: 1, name: "Sneha Kapur", city: "Metro City", points: 4850, itemsRecycled: 42, co2SavedKg: 1120, badge: "Planet Hero" },
    { rank: 2, name: "Arjun Nambiar", city: "Metro City", points: 3920, itemsRecycled: 31, co2SavedKg: 890, badge: "Eco Warrior" },
    { rank: 3, name: "Alex Morgan", city: "Metro City", points: 2670, itemsRecycled: 19, co2SavedKg: 580, badge: "Green Guardian" },
    { rank: 4, name: "Tanya Sen", city: "Metro City", points: 2150, itemsRecycled: 16, co2SavedKg: 460, badge: "Green Novice" },
    { rank: 5, name: "Harish Gupta", city: "Metro City", points: 1840, itemsRecycled: 12, co2SavedKg: 390, badge: "Eco Sprout" }
  ],

  // Monthly Recycling Challenges
  monthlyChallenges: [
    {
      id: "chal-1",
      title: "Operation Battery Banishment",
      description: "Turn in at least 3 dead batteries or power banks for safe neutralization.",
      target: 3,
      current: 2,
      bonusPoints: 250,
      daysLeft: 12,
      badgeIcon: "battery-full"
    },
    {
      id: "chal-2",
      title: "Cable Clear-Out Campaign",
      description: "Collect and recycle 1 kg of tangled wires, broken adapters, or old chargers.",
      target: 100, // 100%
      current: 65,
      bonusPoints: 200,
      daysLeft: 18,
      badgeIcon: "plug"
    },
    {
      id: "chal-3",
      title: "Campus Clean E-Drive",
      description: "Encourage 3 friends to sign up and submit their first e-waste item.",
      target: 3,
      current: 1,
      bonusPoints: 400,
      daysLeft: 24,
      badgeIcon: "users"
    }
  ],

  // Illegal Dumping Complaints (Community Feed)
  dumpingReports: [
    {
      id: "REP-401",
      reporterName: "Anonymous Citizen",
      location: "Near Railway Overbridge, Industrial Sector 9",
      landmark: "Behind abandoned warehouse",
      date: "2026-10-29",
      hazardLevel: "Critical",
      wasteType: "Open burning of computer wire insulation and broken lead CRT tubes",
      status: "INSPECTION_DISPATCHED", // REPORTED, INSPECTION_DISPATCHED, CLEANED_RESOLVED
      adminResponse: "Environmental enforcement squad dispatched. Area cordoned off; authorized recyclers clearing remaining glass shards.",
      imageUrl: "assets/dumping_sample.jpg"
    },
    {
      id: "REP-395",
      reporterName: "Vikas P.",
      location: "Dry canal bed near Subhash Market",
      landmark: "Adjacent to electric substation",
      date: "2026-10-18",
      hazardLevel: "High",
      wasteType: "Commercial dumping of ~40 broken microwave transformers and capacitor oils",
      status: "CLEANED_RESOLVED",
      adminResponse: "Municipal corporation in coordination with EcoGreen Circular Hub recovered all toxic transformers. Penalty notice issued.",
      imageUrl: "assets/dumping_resolved.jpg"
    }
  ],

  // Interactive Quiz Questions
  quizQuestions: [
    {
      id: 1,
      question: "Which hazardous heavy metal commonly found in CRT monitors and solder causes severe neurological damage?",
      options: ["Lead (Pb)", "Silicon (Si)", "Aluminum (Al)", "Iron (Fe)"],
      correct: 0,
      explanation: "Lead is widely present in cathode ray tube funnels and older circuit board solder. It bioaccumulates and causes nervous system damage."
    },
    {
      id: 2,
      question: "What is the primary danger of tossing swollen Lithium-ion batteries into ordinary household garbage?",
      options: [
        "They turn into fertilizer",
        "They can puncture, undergo thermal runaway, and cause explosive garbage truck fires",
        "They dissolve instantly",
        "They evaporate into non-toxic vapor"
      ],
      correct: 1,
      explanation: "Lithium-ion batteries are prone to violent thermal runaway when compressed or punctured by garbage compactor trucks, sparking fierce chemical fires."
    },
    {
      id: 3,
      question: "Approximately how much more gold can be extracted from 1 metric ton of discarded smartphones compared to 1 metric ton of natural gold ore?",
      options: ["Equal amount", "Half as much", "Up to 50 to 100 times more", "There is no gold in phones"],
      correct: 2,
      explanation: "Urban mining is extraordinarily rich: 1 ton of smartphones yields ~300-350g of pure gold, whereas high-grade natural gold ore yields merely 3-5g per ton!"
    },
    {
      id: 4,
      question: "What crucial step must you ALWAYS perform before donating or recycling a smartphone or computer?",
      options: [
        "Soak it in cold soapy water",
        "Backup files, sign out of cloud accounts, and perform a cryptographic factory data wipe",
        "Scratch the screen with keys",
        "Leave your passwords saved on desktop"
      ],
      correct: 1,
      explanation: "A proper cryptographic factory reset prevents identity theft and ensures your personal credentials, banking details, and photos cannot be recovered."
    },
    {
      id: 5,
      question: "What is the core principle of 'Circular Economy' in electronics?",
      options: [
        "Make gadgets round instead of square",
        "Design out waste by keeping materials, components, and devices in productive use through reuse, repair, and closed-loop recycling",
        "Shipping all old gadgets to deep ocean trenches",
        "Burning devices to generate heat"
      ],
      correct: 1,
      explanation: "The circular economy replaces the linear 'take-make-dispose' model with sustainable loops: design for repair, second-life refurbishment, and clean element recovery."
    }
  ],

  // Educational Knowledge Articles
  articles: [
    {
      id: "art-1",
      title: "The Urban Goldmine: Understanding Urban Mining",
      readTime: "4 min read",
      category: "Resource Recovery",
      summary: "Why our landfills contain more precious metals than the world's richest natural gold and platinum mines.",
      content: `
        Modern consumer electronics are the most concentrated source of valuable materials on Earth. 
        A single high-end smartphone contains approximately 0.034g of high-purity gold, 0.35g of silver, 
        and 15g of copper, alongside critical rare-earth elements like Neodymium and Dysprosium.
        
        When these devices are incinerated or buried in municipal dumps, these precious resources are permanently lost, 
        forcing intensive mining that devastates biodiversity. EcoCycle enables closed-loop circular refining 
        that reduces mining emissions by over 85%.
      `
    },
    {
      id: "art-2",
      title: "Safe Data Sanitization: Complete DIY Privacy Guide",
      readTime: "5 min read",
      category: "Security & Safety",
      summary: "A step-by-step checklist to wipe your Android, iPhone, Windows, and Mac before sending them for recycling.",
      content: `
        Before handing any electronic device to a collector or technician:
        1. Decouple Accounts: Sign out of Apple ID / Google Account / Samsung Knox.
        2. Remove Removable Media: Eject SIM cards, SD cards, and USB dongles.
        3. Encrypt Before Erasing: If using an older Android or PC, ensure full disk encryption is turned on before resetting.
        4. Overwrite Storage: On laptops, use free tools like DBAN or built-in BitLocker erase to overwrite drive sectors.
      `
    },
    {
      id: "art-3",
      title: "The Invisible Toxic Legacy: Heavy Metals in Groundwater",
      readTime: "6 min read",
      category: "Environmental Health",
      summary: "How improperly dumped electronics leach mercury, cadmium, and lead into drinking water supplies.",
      content: `
        Electronic waste accounts for only 2% of America and Asia's waste stream by weight, but represents 
        over 70% of heavy metals in landfills. Rainwater percolating through broken monitors and corroded 
        circuit boards forms toxic leachate. This liquid dissolves Lead from solder and Cadmium from 
        rechargeable cells, seeping into regional aquifers and agricultural irrigation canals.
      `
    }
  ]
};

// Export to window object
if (typeof window !== "undefined") {
  window.SEED_DATA = SEED_DATA;
}
