const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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

let locationData = {
    regions: [],
    provinces: [],
    municipalities: [],
    barangays: []
};

let heiData = {
    list: [],
    mapping: {}
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

const loadHeiData = () => {
    const csvPath = path.join(__dirname, 'data', 'Campus_list.csv');
    heiData = {
        list: [],
        mapping: {}
    };
    if (!fs.existsSync(csvPath)) {
        console.warn('⚠️ WARNING: Campus_list.csv NOT FOUND in server/data/');
        return;
    }
    const mapping = {};
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', row => {
            const rawName = row['HEI Name'];
            const rawCampus = row['Campus'];
            if (!rawName) {
                return;
            }
            const heiName = String(rawName).trim();
            const campusName = rawCampus ? String(rawCampus).trim() : '';
            if (!heiName) {
                return;
            }
            if (!mapping[heiName]) {
                mapping[heiName] = [];
            }
            if (campusName && !mapping[heiName].includes(campusName)) {
                mapping[heiName].push(campusName);
            }
        })
        .on('end', () => {
            const list = Object.keys(mapping).sort((a, b) => a.localeCompare(b));
            Object.keys(mapping).forEach(key => {
                mapping[key].sort((a, b) => a.localeCompare(b));
            });
            heiData = {
                list,
                mapping
            };
            console.log(`✅ HEI CSV LOADED: Campus_list.csv (${list.length} HEIs)`);
        })
        .on('error', err => {
            console.error('❌ ERROR: Could not load Campus_list.csv', err.message);
        });
};

loadLocationData();
loadHeiData();

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

app.get('/api/hei-data', (req, res) => {
    res.json(heiData);
});

// ==========================================
// 3. START SERVER
// ==========================================
// Serve static assets in production
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
