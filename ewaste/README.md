# EcoCycle — Smart E-Waste Management & Circular Economy Platform

> **An integrated, AI-assisted web platform connecting citizens, authorized e-waste recyclers, electronics hobbyists, and municipal authorities to divert discarded electronics from landfills into high-value circular recovery.**

![EcoCycle Platform](assets/logo.svg)

---

## 🌟 Overview & Problem Statement

Over **50 million metric tons of electronic waste** are discarded globally each year, yet less than **20%** is formally documented and recycled. E-waste represents only 2% of solid municipal waste streams by weight, but constitutes over **70% of heavy metals (lead, mercury, cadmium)** that leach into regional groundwater supplies. Furthermore, discarded circuit boards and smartphones contain up to **50–100x more gold, silver, and copper per ton than natural ores**.

**EcoCycle** bridges this gap by creating an end-to-end circular ecosystem:
1. **Citizens** are incentivized to responsibly dispose of old gadgets via **Doorstep Pickups** and **EcoPoints rewards**.
2. **AI Computer Vision** identifies product categories, detects toxic hazards, and recommends safe disposal or parts salvage.
3. **Makers & Students** find reusable 18650 cells, microcontrollers, and LCD screens on the **ReUseTech Component Board**.
4. **Collectors & Admins** manage logistics, route dispatches, and secure handovers via **4-digit OTP verification**.

---

## 🚀 Key Modules & Capabilities

### 1. 🚚 Doorstep Pickup Booking & Real-Time Tracking
- **Category Selection**: Smartphones, Laptops, Batteries, Chargers & Cables, CRT/LCD Displays, Circuit Boards, and Home Appliances.
- **Dynamic Scrap Estimator**: Calculates estimated scrap value (₹ / $) and reward points before booking.
- **Handover Security**: Generates a cryptographic **4-digit verification OTP** presented to the collector upon pickup.
- **Interactive Lifecycle Tracker**: 
  - `Booking Received` ➔ `Collector Assigned` ➔ `Out for Pickup` ➔ `Collected & Verified` ➔ `EcoPoints Credited`

### 2. 🧠 AI-Based E-Waste Identification & Hazardous Advisor
- **Image Scanning Simulation**: Drag-and-drop photos of electronics with real-time laser scanning tensor animation.
- **Toxic Chemical Breakdown**: Identifies specific hazards:
  - **Lithium & Cobalt** in battery packs (thermal runaway, acid leakage)
  - **Lead Oxide Glass** in CRT monitors (neurotoxic leachate)
  - **Brominated Flame Retardants (BFR)** in plastics
  - **Mercury vapor** in display backlights
- **Urban Mining Yield**: Calculates recoverable precious metals (Gold, Silver, Tantalum, High-purity Copper).
- **One-Click Pre-fill**: "Book Pickup for this Item" automatically populates the pickup booking form.

### 3. 🗺️ Smart Recycling Center Locator
- **Interactive OpenStreetMap / Leaflet Integration**: Displays certified R2 dismantling centers, drop-off bins, and battery recovery stations.
- **Offline Radar Visualizer**: Seamlessly switches to a futuristic radar fallback visualizer if internet or CDN is unavailable.
- **Haversine Distance Engine**: Computes exact road/aerial kilometers from the citizen's GPS location.
- **Filters & Directions**: Filter by Govt Authorized, Instant Cash Pay, Free Doorstep, and Battery Only; includes direct links to Google Maps navigation.

### 4. 🎁 EcoPoints & Gamified Rewards System
- **Points Ledger & Tiers**: Progress through `Eco Sprout` ➔ `Green Guardian` ➔ `Eco Warrior` ➔ `Planet Hero`.
- **Voucher Catalog**: Redeem points for shopping coupons, gadget repair discounts, Amazon gift cards, and **real trees planted in your name**.
- **Monthly Challenges**: E.g. *"Operation Battery Banishment"* (turn in 3 batteries for +250 bonus points).
- **Community Leaderboard**: Highlights top recyclers by items diverted and CO₂ emissions mitigated.

### 5. 🔌 ReUseTech — Second-Life Marketplace & Component Board
- **Three Circular Streams**:
  - **Refurbished Gadgets**: Buy and sell tested working devices at accessible student prices.
  - **Free Student Donations**: Working monitors, keyboards, and components gifted to schools and students.
  - **Salvageable Components**: 18650 Li-ion cells, stepper drivers, SMD boards, and LCD panels.
- **Component Request Board**: Enables electronics students and technicians to post requests for scrap parts to practice micro-soldering and prototyping.
- **Direct Messaging Modal**: Facilitates peer-to-peer communication between contributors and makers.

### 6. 🌿 Carbon Footprint & Environmental Impact Calculator
- **Scientifically-Backed Life Cycle Assessment (LCA)**:
  - Avoided greenhouse gas emissions (kg CO₂)
  - Toxic heavy metals sequestered from soils (Lead, Mercury, Cadmium)
  - Clean water preserved from chemical contamination (Liters)
  - Equivalent metrics (Mature tree carbon absorption, gasoline car km averted)
- **Interactive Dynamic Bar Chart**: Compares landfill environmental burden against closed-loop recycling.
- **Printable Certificate of Carbon Mitigation**: Generates a personalized digital certificate of environmental stewardship.

### 7. 📢 Citizen Illegal Dumping & Disposal Reporting Portal
- **Community Watch**: Enables citizens to report informal electronic burning, toxic canal dumping, or illicit dismantlers.
- **Geotagged Evidence**: Upload photo evidence, description, and hazard severity level (`Critical`, `High`, `Moderate`).
- **Civic Reward**: Citizens receive **+150 Civic EcoPoints** upon verified report filing.
- **Municipal Incident Feed**: Live updates on enforcement squad dispatch and site remediation.

### 8. 🎓 Educational Awareness Hub & Interactive EcoQuiz
- **Curated Educational Guides**: "The Urban Goldmine", "DIY Safe Data Sanitization", and "Invisible Toxic Legacy in Groundwater".
- **5-Question Interactive Quiz**: Real-time feedback with detailed explanations on circular economy concepts.
- **Mastery Certification**: Scoring ≥60% unlocks the *Circular Economy Specialist* badge and **+100 bonus EcoPoints**.

### 9. 🛡️ Collector & Admin Command Center
- **Role Switcher**: Instant one-click toggle between **Citizen**, **Authorized Collector**, and **System Admin** for fast evaluation.
- **Collector Portal**: View assigned route itineraries, initiate travel (`En Route`), and input citizen OTP to verify physical scale weight.
- **Admin Command Center**: Executive KPI analytics, filterable request management table, route assignment, and **Export Compliance CSV Report**.

---

## 💻 Tech Stack & Architecture

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | HTML5, Modern CSS3 (Glassmorphism & CSS Variables), Tailwind CSS CDN, FontAwesome 6 Icons |
| **Mapping & GIS** | Leaflet.js, OpenStreetMap API, Haversine Distance Algorithm, Offline SVG Radar Map |
| **State & Persistence** | Browser `LocalStorage` Architecture (Pre-seeded with rich demo dataset) |
| **Local Web Server** | PowerShell built-in `.NET System.Net.HttpListener` (`start_server.ps1`) |
| **Cross-Platform Compatibility** | 100% Client-side executable; runs directly in Google Chrome, Microsoft Edge, Firefox, or Safari |

---

## ⚡ How to Run the Project

### Option 1: Direct File Launch (No Server Required)
Simply double-click `run.bat` or open `index.html` directly in any modern web browser:
```cmd
# In Windows PowerShell / Command Prompt:
start index.html
```

### Option 2: Local HTTP Server (PowerShell)
To serve the platform over local HTTP (`http://localhost:8080`):
```powershell
powershell -ExecutionPolicy Bypass -File .\start_server.ps1
```

---

## 🎯 College Presentation & Evaluation Guide

When presenting this project for college evaluation or a hackathon:

1. **Start on Home Dashboard**: Highlight the live metrics ticker (`14,820 kg diverted`) and explain the circular economy mission.
2. **Demonstrate AI E-Waste Identifier**:
   - Click one of the test presets (e.g. *Lithium Battery Pack* or *Cracked Smartphone*).
   - Show the scanning laser beam animation, toxic hazard breakdown, and precious metal recovery yield.
   - Click **"Book Doorstep Pickup for this Item"** to show how data seamlessly pre-fills the collection form!
3. **Demonstrate Doorstep Pickup & OTP Tracking**:
   - Complete the pickup form; note how estimated EcoPoints and scrap value recalculate in real time.
   - Show the generated **4-digit OTP** and the live 5-step progress bar.
4. **Demonstrate Role Switching**:
   - Use the top-right role switcher to change to **Collector (Vikram)**.
   - Switch to the **Collector Ops** tab, click **Verify OTP & Collect E-Waste**, input the OTP, and watch points instantly credit to the citizen!
5. **Show Carbon Footprint Calculator & Certificate**:
   - Adjust the device quantity sliders to demonstrate dynamic LCA emission factor calculations.
   - Click **Generate Official Carbon Mitigation Certificate** to reveal the printable certificate.
6. **Show ReUseTech Marketplace & EcoQuiz**:
   - Highlight component salvage for engineering students.
   - Take the 5-question EcoQuiz to show educational gamification.

---

## 📄 License & Credits
Developed as an open-source educational e-waste management and environmental circularity platform.
ISO 14001 Standards & Circular Economy Guidelines compliant.
