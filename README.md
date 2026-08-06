# SentinelAI — AI-Powered Public Safety & Police Tactical Command Platform

SentinelAI is a next-generation decision intelligence platform built for public safety, citizen hazard reporting, real-time spatial telemetry visualization, and police tactical command dispatching.

---

## 🌟 Key Features

### 🛡️ 1. Citizen Safety Portal & Spatial Map
- **Interactive Google Maps Layering:** Seamlessly switches between Google Maps Light Roadmap, Google Satellite, and Sentinel Dark tile layers.
- **50+ Live Telemetry Map Pins:** Renders historical and real-time incident pins, dark streetlight zones, police precinct stations, hospitals, 4K CCTV camera arrays, and citizen safe havens across Greater Hyderabad.
- **Real-Time Safety Score Engine:** Calculates deterministic risk scores (0–100) based on kernel density incident risk, active streetlight ratios, CCTV coverage, and station proximity.
- **OSRM Road Network Routing:** Computes turn-by-turn road network geometry comparing **Direct Shortest Road Route** vs **Recommended Safe Road Corridor** (*detouring via well-lit arterial avenues & police patrol corridors*).

### 📣 2. Low-Friction Citizen Incident Reporting
- **Multi-Modal Location Selection:** Set incident locations via **🎯 Live GPS Location Detection**, **📍 Hyderabad Landmark Search**, or **🗺️ Interactive Map Point Click**.
- **Automated PII Redaction Guardrails:** Express backend automatically scrubs personally identifiable information (phone numbers, email addresses, names) before saving records.
- **Live Synchronized Community Feed:** Citizen reports are instantly synchronized across the Citizen Portal and Police Command Center.

### 🚓 3. Police Tactical Command & Operations Center
- **Emergency Patrol Unit Dispatch Console:** Dispatches the nearest active patrol unit (`PATROL-401`, `PATROL-402`, etc.) to high-severity citizen incidents in real time.
- **Active Patrol Fleet Console:** Live fleet tracking with commander info, status indicators (`ON PATROL`, `DISPATCHED`, `STANDBY`), and instant sector reassignment.
- **Gemini AI Shift Patrol Optimizer:** Computes sector risk index math and synthesizes operational shift briefings.
- **Incident Triage Queue:** Filter, verify, dismiss, or resolve reported hazards.

### 🔒 4. Strict Security & Role-Based Separation
- **Citizen Portal:** Authenticates via Mobile Phone Number + 6-Digit SMS OTP Verification + Profile Details (*Full Name, Age, Gender*).
- **Police Command Portal:** Gated behind official Police Credentials (*Badge ID & Password*). Unauthenticated or citizen access is blocked with a 403 Forbidden screen.

---

## 🏗️ Tech Stack & Architecture

- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, Leaflet / React-Leaflet, Lucide Icons, Recharts.
- **Backend:** Express.js, Node.js, TypeScript, Zod Schema Validation, JWT Authentication, Bcrypt.
- **AI Explanation Engine:** Google Gemini 1.5 Flash SDK backend integration.
- **Routing Engine:** Open Source Routing Machine (OSRM) driving API.
- **Database:** PostgreSQL + PostGIS Schema & In-Memory Fallback Data Store.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend server will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend application will start on `http://localhost:5173`.

---

## 🔑 Default Demo Credentials

- **Citizen Login:** Any 10-digit Mobile Number (e.g., `+91 9876543210`) | OTP: `123456`
- **Police Official Login:** Badge ID: `P-8842` | Password: `Sentinel123!`

---

## 📄 License
MIT License. Developed for Public Safety Decision Intelligence.
