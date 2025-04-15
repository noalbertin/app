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
    cb(null, 'backend/uploads/enfant');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


// Fonction pour vérifier si le CIN est unique dans les tables travailleur, conjoint et enfants
const checkUniqueCIN = (cin) => {
  return new Promise((resolve, reject) => {
    if (cin === 0) {
      return resolve(true);  // Ne pas vérifier l'unicité pour les CIN à 0
    }

    const query = `
      SELECT cin_travailleur FROM travailleur WHERE cin_travailleur = ? AND cin_travailleur
      UNION 
      SELECT cin_conjoint FROM conjoint WHERE cin_conjoint = ? AND cin_conjoint
      UNION
      SELECT cin_enfant FROM enfants WHERE cin_enfant = ? AND cin_enfant != 0`;

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


router.post('/add', upload.single('image_enfant'), async (req, res) => {
  const { nom_enfant, prenom_enfant, sexe_enfant, age_enfant, cin_enfant, id_travailleur } = req.body;
  console.log(req.body);

  try {

    let finalCIN = cin_enfant;

    // Si l'âge de l'enfant est inférieur à 18 ans, le CIN est facultatif et défini à 0
    if (age_enfant < 18) {
      finalCIN = 0; // CIN non requis pour les enfants mineurs
    } else {
      // Vérification si le CIN est unique pour les enfants de plus de 18 ans
      const isCINUnique = await checkUniqueCIN(cin_enfant);
      if (!isCINUnique) {
        return res.status(400).json({
          error: 'Le CIN est déjà utilisé dans la table des travailleurs, conjoints ou enfants. Veuillez entrer un CIN unique.'
        });
      }
    }

    const sql = `INSERT INTO Enfants 
      (nom_enfant, prenom_enfant, sexe_enfant, age_enfant, cin_enfant, imageUrl_enfant, id_travailleur)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const imageUrl_enfant = req.file ? `backend/uploads/enfant/${req.file.filename}` : null;

    const values = [
      nom_enfant,
      prenom_enfant,
      sexe_enfant,
      age_enfant,
      finalCIN,  // CIN final (0 pour mineurs)
      imageUrl_enfant, 
      id_travailleur
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout de l'enfant:", err);
        return res.status(500).json({ error: "Erreur lors de l'ajout de l'enfant", details: err });
      }
      return res.status(201).json({ message: "Enfant ajouté avec succès", enfantId: result.insertId });
    });

  } catch (error) {
    console.error("Erreur lors de la vérification du CIN:", error);
    return res.status(500).json({ error: "Erreur interne du serveur", details: error });
  }
});


// Route pour récupérer tous les enfants
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM Enfants';
  db.query(sql, (err, result) => {
    if (err) return res.json({ error: 'Erreur lors de la récupération des enfants' });
    return res.json(result);
  });
});



// Route pour récupérer un enfant spécifique
router.get('/:id_enfant', (req, res) => {
  const sql = 'SELECT * FROM Enfants WHERE id_enfant = ?';
  db.query(sql, [req.params.id_enfant], (err, result) => {
    if (err) return res.json({ error: 'Erreur lors de la récupération du enfant' });
    return res.json(result[0]);
  });
});

// Route pour mettre à jour un enfant
router.put('/modifierEnfant/:id_enfant', upload.single('image_enfant'), (req, res) => {
  const sql = `UPDATE Enfants 
               SET nom_enfant = ?, prenom_enfant=?, sexe_enfant = ?, age_enfant = ?, cin_enfant = ?, 
                   imageUrl_enfant = ?, nomMere_enfant = ?, id_travailleur = ? 
               WHERE id_enfant = ?`;
  const imageUrl_enfant = req.file ? `/uploads/enfant/${req.file.filename}` : req.body.imageUrl_enfant;
  
  const values = [
    req.body.nom_enfant,
    req.body.prenom_enfant,
    req.body.sexe_enfant,
    req.body.age_enfant,
    req.body.cin_enfant,
    imageUrl_enfant,
    req.body.nomMere_enfant,
    req.body.id_travailleur,
    req.params.id_enfant
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.json({ error: "Erreur lors de la mise à jour du enfant", details: err });
    return res.json({ message: "Enfants mis à jour avec succès" });
  });
});

// Route pour supprimer un enfant
router.delete('/supprimerEnfant/:id_enfant', (req, res) => {
  const sql = 'DELETE FROM Enfants WHERE id_enfant = ?';
  db.query(sql, [req.params.id_enfant], (err, result) => {
    if (err) return res.json({ error: "Erreur lors de la suppression du enfant", details: err });
    return res.json({ message: "Enfants supprimé avec succès" });
  });
});

export default router;
