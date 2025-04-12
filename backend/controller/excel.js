import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import mysql from 'mysql';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Configurer la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stage', // Remplacez par le nom de votre base de données
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

// Endpoint pour le traitement de fichier
router.post('/traiter', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé' });
  }

  const filePath = req.file.path;
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Vérifier que les en-têtes sont corrects et que les lignes de données existent
  if (data.length < 4) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Le fichier Excel ne contient pas assez de lignes' });
  }

  // Récupération des métadonnées depuis la deuxième ligne
  const metadata = {
    groupe_critere: data[1][3],
    direction: data[1][6],
    region: data[1][8],
    district: data[1][10],
    commune: data[1][12],
    fokontany: data[1][14],
  };

  // Récupérer les en-têtes de la troisième ligne
  const headers = data[2];

  // Mapper les données à insérer (à partir de la quatrième ligne)
const insertData = data.slice(3)
.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== '')) // Vérifier que la ligne n'est pas vide
.map(row => [
  row[headers.indexOf("Num Ménage")],
  row[headers.indexOf("Nom du chef de ménage")],
  row[headers.indexOf("Statut")],
  row[headers.indexOf("Récepteur du transfert")],
  row[headers.indexOf("Sexe")],
  row[headers.indexOf("CIN récépteur")],
  row[headers.indexOf("Nom travailleur")],
  row[headers.indexOf("Remplaçant")],
  row[headers.indexOf("Nom du mère")],
  metadata.groupe_critere,
  metadata.direction,
  metadata.region,
  metadata.district,
  metadata.commune,
  metadata.fokontany
]);


  // Préparer la requête SQL pour l'insertion
  const sql = `
    INSERT INTO EXCEL (
      num_ménage, nom_chef_ménage, statut, récepteur_transfert, sexe, cin_récepteur, 
      nom_travailleur, remplaçant, mère, groupe_critere, direction, region, district, commune, fokontany
    ) VALUES ?
  `;

  // Exécuter la requête SQL pour insérer les données
  db.query(sql, [insertData], (err) => {
    // Supprimer le fichier temporaire après le traitement
    fs.unlinkSync(filePath);

    if (err) {
      console.error('Erreur lors de l\'insertion des données dans la base de données :', err);
      res.status(500).json({ message: 'Erreur lors de l\'insertion des données dans la base de données' });
    } else {
      res.status(200).json({ message: 'Données insérées avec succès' });
    }
  });
});

// Route pour récupérer tous les travailleurs
router.get('/', (req, res) => {
    const query = 'SELECT * FROM excel';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données :', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des données' });
    } else {
      res.json(results);
    }
  });
});


// Endpoint pour récupérer les noms communs et les informations des doublons
router.get('/noms-communs', (req, res) => {
  const query = `
    SELECT
      e1.id AS id_1,
      e1.num_ménage AS num_ménage_1,
      e1.nom_chef_ménage AS nom_chef_ménage_1,
      e1.statut AS statut_1,
      e1.récepteur_transfert AS récepteur_transfert_1,
      e1.sexe AS sexe_1,
      e1.cin_récepteur AS cin_récepteur_1,
      e1.nom_travailleur AS nom_travailleur_1,
      e1.remplaçant AS remplaçant_1,
      e1.groupe_critere AS groupe_critere_1,
      e1.direction AS direction_1,
      e1.region AS region_1,
      e1.district AS district_1,
      e1.commune AS commune_1,
      e1.fokontany AS fokontany_1,
      e1.mère AS mère_1,
      e2.id AS id_2,
      e2.num_ménage AS num_ménage_2,
      e2.nom_chef_ménage AS nom_chef_ménage_2,
      e2.statut AS statut_2,
      e2.récepteur_transfert AS récepteur_transfert_2,
      e2.sexe AS sexe_2,
      e2.cin_récepteur AS cin_récepteur_2,
      e2.nom_travailleur AS nom_travailleur_2,
      e2.remplaçant AS remplaçant_2,
      e2.groupe_critere AS groupe_critere_2,
      e2.direction AS direction_2,
      e2.region AS region_2,
      e2.district AS district_2,
      e2.commune AS commune_2,
      e2.fokontany AS fokontany_2,
      e2.mère AS mère_2,
      CASE
        WHEN e1.nom_chef_ménage = e2.nom_chef_ménage THEN e1.nom_chef_ménage
        WHEN e1.nom_chef_ménage = e2.récepteur_transfert THEN e1.nom_chef_ménage
        WHEN e1.nom_chef_ménage = e2.nom_travailleur THEN e1.nom_chef_ménage
        WHEN e1.nom_chef_ménage = e2.remplaçant THEN e1.nom_chef_ménage
        WHEN e1.nom_chef_ménage = e2.mère THEN e1.nom_chef_ménage
        WHEN e1.récepteur_transfert = e2.nom_chef_ménage THEN e1.récepteur_transfert
        WHEN e1.récepteur_transfert = e2.récepteur_transfert THEN e1.récepteur_transfert
        WHEN e1.récepteur_transfert = e2.nom_travailleur THEN e1.récepteur_transfert
        WHEN e1.récepteur_transfert = e2.remplaçant THEN e1.récepteur_transfert
        WHEN e1.récepteur_transfert = e2.mère THEN e1.récepteur_transfert
        WHEN e1.nom_travailleur = e2.nom_chef_ménage THEN e1.nom_travailleur
        WHEN e1.nom_travailleur = e2.récepteur_transfert THEN e1.nom_travailleur
        WHEN e1.nom_travailleur = e2.nom_travailleur THEN e1.nom_travailleur
        WHEN e1.nom_travailleur = e2.remplaçant THEN e1.nom_travailleur
        WHEN e1.nom_travailleur = e2.mère THEN e1.nom_travailleur
        WHEN e1.remplaçant = e2.nom_chef_ménage THEN e1.remplaçant
        WHEN e1.remplaçant = e2.récepteur_transfert THEN e1.remplaçant
        WHEN e1.remplaçant = e2.nom_travailleur THEN e1.remplaçant
        WHEN e1.remplaçant = e2.remplaçant THEN e1.remplaçant
        WHEN e1.remplaçant = e2.mère THEN e1.remplaçant
        WHEN e1.mère = e2.nom_chef_ménage THEN e1.mère
        WHEN e1.mère = e2.récepteur_transfert THEN e1.mère
        WHEN e1.mère = e2.nom_travailleur THEN e1.mère
        WHEN e1.mère = e2.remplaçant THEN e1.mère
        WHEN e1.mère = e2.mère THEN e1.mère
        ELSE NULL
      END AS nom_commun
    FROM 
      EXCEL e1
    JOIN 
      EXCEL e2 
    ON 
      e1.num_ménage < e2.num_ménage
      AND (
        e1.nom_chef_ménage IN (e2.nom_chef_ménage, e2.récepteur_transfert, e2.nom_travailleur, e2.remplaçant, e2.mère)
        OR e1.récepteur_transfert IN (e2.nom_chef_ménage, e2.récepteur_transfert, e2.nom_travailleur, e2.remplaçant, e2.mère)
        OR e1.nom_travailleur IN (e2.nom_chef_ménage, e2.récepteur_transfert, e2.nom_travailleur, e2.remplaçant, e2.mère)
        OR e1.remplaçant IN (e2.nom_chef_ménage, e2.récepteur_transfert, e2.nom_travailleur, e2.remplaçant, e2.mère)
        OR e1.mère IN (e2.nom_chef_ménage, e2.récepteur_transfert, e2.nom_travailleur, e2.remplaçant, e2.mère)
      )
    HAVING
      nom_commun IS NOT NULL;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des noms communs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des noms communs' });
    } else {
      res.json(results);
    }
  });
});

router.delete('/supprimerExcel/:id', async (req, res) => {
  try {
      const id = req.params.id;

      // Verify if `id` is valid
      if (!id) {
          return res.status(400).json({ Message: 'Invalid ID provided' });
      }

      const sql = 'DELETE FROM excel WHERE id = ?';

      db.query(sql, [id], (err, results) => {
        if (err) {
          console.error('Erreur lors de la suppression des données :', err);
          return res.status(500).json({ message: 'Erreur lors de la suppression des données' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ Message: 'Excel non trouvé' });
        }

        res.status(200).json({ Message: 'Suppression Excel réussie' });
      });
  } catch (err) {
      console.error('Error deleting Excel entry:', err); // Log the error
      return res.status(500).json({ Message: `Oups! DELETE Excel non réussi: ${err.message}` });
  }
});







export default router;
