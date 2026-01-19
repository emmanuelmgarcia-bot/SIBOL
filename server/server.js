const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Load Env Variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const heiRoutes = require('./routes/heiRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const websiteRoutes = require('./routes/websiteRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// 1. SUPABASE ROUTES (Database)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/heis', heiRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/website', websiteRoutes);

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
const clientDistPath = path.join(__dirname, '../client/dist');
const sibolDistPath = path.join(__dirname, '../SibolSite/dist');

app.use('/portal', express.static(clientDistPath));

app.get('/portal/*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.use(express.static(sibolDistPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(sibolDistPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
