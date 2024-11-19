import express from 'express';
import mysql from 'mysql';


const router = express.Router();
// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stage'
});


// Route pour récupérer tous les conjoints
  router.get('/:id_travailleur', (req, res) => {
    const { id_travailleur } = req.params;
  
    const sql = `
      SELECT 
        t.id_travailleur, 
        t.nom_travailleur, 
        t.sexe_travailleur, 
        t.age_travailleur, 
        t.cin_travailleur, 
        t.imageUrl_travailleur,
        c.id_conjoint,
        c.nom_conjoint,
        c.sexe_conjoint,
        c.age_conjoint,
        c.cin_conjoint,
        c.imageUrl_conjoint,
        e.id_enfant,
        e.nom_enfant,
        e.sexe_enfant,
        e.age_enfant,
        e.cin_enfant,
        e.imageUrl_enfant
      FROM travailleur t
      LEFT JOIN conjoint c ON t.id_travailleur = c.id_travailleur
      LEFT JOIN enfants e ON t.id_travailleur = e.id_travailleur
      WHERE t.id_travailleur = ?`; // Utilisation du paramètre id_travailleur pour la requête
  
    // Exécution de la requête SQL
    db.query(sql, [id_travailleur], (err, result) => {
      if (err) {
        return res.json({ error: 'Erreur lors de la récupération des informations du travailleur' });
      }
      return res.json(result);
    });
  });


  router.get('/selectionner_remplacant/:id_travailleur', (req, res) => {
    const { id_travailleur } = req.params; // Récupération correcte depuis req.params
    
    const sql = `
      SELECT 
  t.id_travailleur, 
  t.nom_travailleur,
  c.id_conjoint,
  c.nom_conjoint,
  DATE_FORMAT(c.age_conjoint, '%Y-%m-%d') AS age_conjoint, -- Formater la date
  c.imageUrl_conjoint,
  c.sexe_conjoint,
  e.id_enfant,
  e.nom_enfant,
  DATE_FORMAT(e.age_enfant, '%Y-%m-%d') AS age_enfant, -- Formater la date
  e.imageUrl_enfant,
  e.sexe_enfant
FROM travailleur t
LEFT JOIN conjoint c ON t.id_travailleur = c.id_travailleur
LEFT JOIN enfants e ON t.id_travailleur = e.id_travailleur
WHERE t.id_travailleur = ?

    `;
    
    db.query(sql, [id_travailleur], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des informations du travailleur' });
      }
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Travailleur non trouvé' });
      }
  
      const travailleur = {
        id: result[0].id_travailleur,
        nom: result[0].nom_travailleur,
      };
  
      const conjoint = result[0].id_conjoint ? {
        id: result[0].id_conjoint,
        nom: result[0].nom_conjoint,
        age: result[0].age_conjoint,
        imageUrl: result[0].imageUrl_conjoint,
        sexe: result[0].sexe_conjoint
      } : null;
  
      const enfants = result.filter(row => row.id_enfant).map(row => ({
        id: row.id_enfant,
        nom: row.nom_enfant,
        age: row.age_enfant,
        imageUrl: row.imageUrl_enfant,
        sexe: row.sexe_enfant
      }));
  
      const remplaçants = {
        travailleur,
        conjoint,
        enfants
      };
  
      return res.json(remplaçants);
    });
  });
  
  // Create Remplacant route
router.post('/addRemplacant', (req, res) => {
  const { id_travailleur, id_remplacant } = req.body;
  console.log(req.body);

  // Validation query to check if the conjoint or enfant belongs to the travailleur
  const validationSql = `
    SELECT 
      t.nom_travailleur, 
      c.id_conjoint, c.nom_conjoint, 
      e.id_enfant, e.nom_enfant 
    FROM travailleur t
    LEFT JOIN conjoint c ON t.id_travailleur = c.id_travailleur
    LEFT JOIN enfants e ON t.id_travailleur = e.id_travailleur
    WHERE t.id_travailleur = ?
  `;

  db.query(validationSql, [id_travailleur], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la vérification du travailleur et de sa famille' });
    }

    if (!result.length) {
      return res.status(404).json({ error: 'Travailleur introuvable' });
    }

    // Extract valid conjoint and enfant IDs
    const validConjointId = result[0]?.id_conjoint;
    const validEnfantIds = result.map(row => row.id_enfant).filter(id => id); // Filter out null values

    // If the remplaçant is either the conjoint or enfant
    const isSelfReplacement = false; // Assuming we're not handling self-replacement here
    if (id_remplacant === validConjointId || validEnfantIds.includes(id_remplacant)) {
      // Insert into Remplacant
      const sql = `
        INSERT INTO Remplacant (id_travailleur, conjointId, enfantId, is_self_replacement)
        VALUES (?, ?, ?, ?)
      `;
      
      db.query(sql, [
        id_travailleur, 
        isSelfReplacement ? null : (id_remplacant === validConjointId ? id_remplacant : null),
        isSelfReplacement ? null : (validEnfantIds.includes(id_remplacant) ? id_remplacant : null),
        isSelfReplacement
      ], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de l\'ajout du remplaçant' });
        }
        return res.status(200).json({ message: 'Remplaçant ajouté avec succès', result });
      });
    } else {
      // If validation fails
      return res.status(400).json({ error: 'Le remplaçant doit être le conjoint ou un de ses enfants' });
    }
  });
});

  

  
  
  export default router;
  