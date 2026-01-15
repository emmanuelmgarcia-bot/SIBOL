const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load Env Variables
dotenv.config();

// Import Supabase Routes
const authRoutes = require('./routes/authRoutes');
const heiRoutes = require('./routes/heiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. SUPABASE ROUTES (Database)
// ==========================================
// These handle Login and the Master HEI List
app.use('/api/auth', authRoutes); // POST /api/auth/login
app.use('/api/heis', heiRoutes);  // GET /api/heis

// ==========================================
// 2. LEGACY LOCATION DATA (JSON Files)
// ==========================================
// We keep this file-based because the PSGC data is huge and rarely changes.
let locationData = {
    regions: [],
    provinces: [],
    municipalities: [],
    barangays: []
};

const loadLocationData = () => {
    const dataPath = path.join(__dirname, 'data');
    
    const loadJson = (filename, key) => {
        const filePath = path.join(dataPath, filename);
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                locationData[key] = JSON.parse(raw);
                console.log(`✅ JSON LOADED: ${filename} (${locationData[key].length} entries)`);
            } catch (err) {
                console.error(`❌ ERROR: Could not parse ${filename}`);
            }
        } else {
            console.warn(`⚠️ WARNING: ${filename} NOT FOUND in server/data/`);
        }
    };

    loadJson('regions.json', 'regions');
    loadJson('provinces.json', 'provinces');
    loadJson('municipalities.json', 'municipalities');
    loadJson('barangays.json', 'barangays');
};

// Initialize Location Data
loadLocationData();

// Location Routes
app.get('/api/regions', (req, res) => res.json(locationData.regions));

app.get('/api/provinces/:region', (req, res) => {
    const regionName = req.params.region;
    const filtered = locationData.provinces.filter(p => p.region === regionName);
    res.json(filtered.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/municipalities/:province', (req, res) => {
    const provinceName = req.params.province;
    const filtered = locationData.municipalities.filter(m => m.province === provinceName);
    res.json(filtered.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/barangays/:municipality', (req, res) => {
    const munName = req.params.municipality;
    const filtered = locationData.barangays.filter(b => b.citymun === munName);
    res.json(filtered.sort((a, b) => a.name.localeCompare(b.name)));
});

// ==========================================
// 3. START SERVER
// ==========================================
app.get('/', (req, res) => {
    res.send('SIBOL API is Running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});