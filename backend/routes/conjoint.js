import express from 'express';
import mysql from 'mysql';
import multer from 'multer';
import path from 'path';

const router = express.Router();
// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stage'
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backend/uploads/conjoint');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Route pour récupérer tous les conjoints
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM Conjoint';
  db.query(sql, (err, result) => {
    if (err) return res.json({ error: 'Erreur lors de la récupération des conjoints' });
    return res.json(result);
  });
});


// Get conjoint by travailleur ID
router.get('/select_conjoint/:id_travailleur', (req, res) => {
  const { id_travailleur } = req.params;

  // SQL query to get the conjoint based on travailleur ID
  const sql = `SELECT nom_conjoint, prenom_conjoint FROM Conjoint WHERE id_travailleur = ?`;

  db.query(sql, [id_travailleur], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Conjoint not found' });
    }

    res.json(result[0]); // Return the first result (nom_conjoint)
  });
});



// Route pour récupérer tous les conjoints
router.get('/selectionner_conjoint', (req, res) => {
  const sql = 'SELECT id_conjoint, nom_conjoint, prenom_conjoint FROM Conjoint';

  // Ajoutez un log pour voir si la requête est appelée
  console.log("Récupération des conjoints...");

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des conjoints:', err); // Log l'erreur
      return res.status(500).json({ error: 'Erreur lors de la récupération des conjoints' });
    }

    // Vérifiez ce que contient result
    console.log("Résultat de la requête:", result);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucun conjoint trouvé' });
    }

    return res.status(200).json(result); // Retourner les résultats si tout va bien
  });
});


// Fonction pour vérifier si le CIN est unique dans les tables travailleur, conjoint et enfants
const checkUniqueCIN = (cin) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT cin_travailleur FROM travailleur WHERE cin_travailleur = ? 
      UNION 
      SELECT cin_conjoint FROM conjoint WHERE cin_conjoint = ?
      UNION
      SELECT cin_enfant FROM enfants WHERE cin_enfant = ?`;

    db.query(query, [cin, cin, cin], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length > 0) {
        return resolve(false);  // Le CIN existe déjà dans l'une des tables
      }
      return resolve(true);     // Le CIN est unique
    });
  });
};

router.post('/addConjoint', upload.single('image_conjoint'), async (req, res) => {
  console.log(req.body);  // Afficher req.body pour voir les données envoyées
  console.log(req.file);  // Afficher req.file pour voir si l'image est bien reçue

  const { nom_conjoint, sexe_conjoint, age_conjoint, cin_conjoint,prenom_conjoint, id_travailleur } = req.body;
  
  try {
    // Vérification si le CIN est unique
    const isCINUnique = await checkUniqueCIN(cin_conjoint);
    if (!isCINUnique) {
      return res.status(400).json({ error: 'Le CIN est déjà utilisé dans la table des travailleurs, conjoints ou enfants. Veuillez entrer un CIN unique.' });
    }

    // Chemin vers l'image
    const imageUrl_conjoint = req.file ? `backend/uploads/conjoint/${req.file.filename}` : null;

    // Insertion du conjoint dans la base de données
    const sql = `INSERT INTO Conjoint 
      (nom_conjoint, sexe_conjoint, age_conjoint, cin_conjoint, imageUrl_conjoint, prenom_conjoint, id_travailleur)
      VALUES (?,?,?,?,?,?,?)`;

    const values = [nom_conjoint, sexe_conjoint, age_conjoint, cin_conjoint, imageUrl_conjoint,prenom_conjoint,  id_travailleur];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout du conjoint:", err);
        return res.json({ error: "Erreur lors de l'ajout du conjoint", details: err });
      }
      return res.json({ message: "Conjoint ajouté avec succès", result });
    });

  } catch (error) {
    console.error("Erreur lors de la vérification du CIN:", error);
    return res.status(500).json({ error: "Erreur lors de la vérification du CIN" });
  }
});



// Route pour récupérer un conjoint spécifique
router.get('/:id_conjoint', (req, res) => {
  const sql = 'SELECT * FROM Conjoint WHERE id_conjoint = ?';
  db.query(sql, [req.params.id_conjoint], (err, result) => {
    if (err) return res.json({ error: 'Erreur lors de la récupération du conjoint' });
    return res.json(result[0]);
  });
});

// Route pour mettre à jour un conjoint
router.put('/modifierConjoint/:id_conjoint', upload.single('image_conjoint'), (req, res) => {
  const sql = `UPDATE Conjoint 
               SET nom_conjoint = ?,prenom_conjoint = ?, sexe_conjoint = ?, age_conjoint = ?, cin_conjoint = ?, 
                   imageUrl_conjoint = ?, nomMere_conjoint = ?, id_travailleur = ? 
               WHERE id_conjoint = ?`;
  const imageUrl_conjoint = req.file ? `/uploads/conjoint/${req.file.filename}` : req.body.imageUrl_conjoint;
  
  const values = [
    req.body.nom_conjoint,
    req.body.prenom_conjoint,
    req.body.sexe_conjoint,
    req.body.age_conjoint,
    req.body.cin_conjoint,
    imageUrl_conjoint,
    req.body.nomMere_conjoint,
    req.body.id_travailleur,
    req.params.id_conjoint
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.json({ error: "Erreur lors de la mise à jour du conjoint", details: err });
    return res.json({ message: "Conjoint mis à jour avec succès" });
  });
});

// Route pour supprimer un conjoint
router.delete('/supprimerConjoint/:id_conjoint', (req, res) => {
  const sql = 'DELETE FROM Conjoint WHERE id_conjoint = ?';
  db.query(sql, [req.params.id_conjoint], (err, result) => {
    if (err) return res.json({ error: "Erreur lors de la suppression du conjoint", details: err });
    return res.json({ message: "Conjoint supprimé avec succès" });
  });
});

export default router;
