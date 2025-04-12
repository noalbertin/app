import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import travailleurRoutes from './backend/routes/travailleur.js';
import conjointRoutes from './backend/routes/conjoint.js';
import enfantRoutes from './backend/routes/enfants.js';
import remplacantRoutes from './backend/routes/remplacant.js';
import controllerRoutes from './backend/controller/controller.js';
import histogrammeRoutes from './backend/controller/histogramme.js';
import comparaisonRoutes from './backend/controller/comparaison.js'
import excelRoutes from './backend/controller/excel.js'
// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
// Utilisation des routes dans l'application
app.use('/travailleur', travailleurRoutes);
app.use('/conjoint', conjointRoutes);
app.use('/enfant', enfantRoutes);
app.use('/remplacant', remplacantRoutes);
// Servir les fichiers statiques du dossier "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));
app.use('/controller', controllerRoutes);
app.use('/histogramme', histogrammeRoutes);
app.use('/comparaison', comparaisonRoutes);
app.use('/excel', excelRoutes);
// Démarrer le serveur
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});