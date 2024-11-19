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

// Route pour récupérer les informations du travailleur
router.get('/age/:id_travailleur', (req, res) => {
    const { id_travailleur } = req.params; 
    console.log('id_travailleur:', id_travailleur); 
  
    const query = `
     SELECT
  -- Calculer le nombre total de majeurs (conjoint + enfants)
  (CASE 
    WHEN TIMESTAMPDIFF(YEAR, c.age_conjoint, CURDATE()) >= 18 
    THEN 1 ELSE 0 
   END) +
  SUM(CASE 
    WHEN TIMESTAMPDIFF(YEAR, e.age_enfant, CURDATE()) >= 18 
    THEN 1 ELSE 0 
  END)+1 AS nombre_majeurs,

  -- Calculer le nombre total de mineurs (conjoint + enfants)
  (CASE 
    WHEN TIMESTAMPDIFF(YEAR, c.age_conjoint, CURDATE()) < 18 
    THEN 1 ELSE 0 
   END) +
  SUM(CASE 
    WHEN TIMESTAMPDIFF(YEAR, e.age_enfant, CURDATE()) < 18 
    THEN 1 ELSE 0 
  END) AS nombre_mineurs,

  -- Additionner nombre_majeurs et nombre_mineurs pour obtenir total_age
  (
    (CASE 
      WHEN TIMESTAMPDIFF(YEAR, c.age_conjoint, CURDATE()) >= 18 
      THEN 1 ELSE 0 
     END) +
    SUM(CASE 
      WHEN TIMESTAMPDIFF(YEAR, e.age_enfant, CURDATE()) >= 18 
      THEN 1 ELSE 0 
    END) +
    (CASE 
      WHEN TIMESTAMPDIFF(YEAR, c.age_conjoint, CURDATE()) < 18 
      THEN 1 ELSE 0 
     END) +
    SUM(CASE 
      WHEN TIMESTAMPDIFF(YEAR, e.age_enfant, CURDATE()) < 18 
      THEN 1 ELSE 0 
    END)
  )+1 AS total_age

FROM travailleur t
LEFT JOIN Conjoint c ON t.id_travailleur = c.id_travailleur
LEFT JOIN Enfants e ON t.id_travailleur = e.id_travailleur
WHERE t.id_travailleur = ?
GROUP BY t.id_travailleur;


    `;
  
    db.query(query, [id_travailleur], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        return;
      }
  
      // Vérifier s'il y a des résultats
      if (results.length > 0) {
        res.json(results[0]); // Retourner le premier résultat (car GROUP BY id_travailleur)
      } else {
        res.status(404).json({ error: 'Travailleur non trouvé' });
      }
    });
  });

// Route pour récupérer le nombre d'hommes et de femmes pour un travailleur donné
router.get('/sexe/:id_travailleur', async (req, res) => {
    const { id_travailleur } = req.params;
    const query = `
      SELECT 
        -- Comptage du sexe du travailleur
        SUM(CASE WHEN t.sexe_travailleur = 'Homme' THEN 1 ELSE 0 END) AS total_hommes_travailleur,
        SUM(CASE WHEN t.sexe_travailleur = 'Femme' THEN 1 ELSE 0 END) AS total_femmes_travailleur,
  
        -- Comptage du sexe du conjoint
        SUM(CASE WHEN c.sexe_conjoint = 'Homme' THEN 1 ELSE 0 END) AS total_hommes_conjoint,
        SUM(CASE WHEN c.sexe_conjoint = 'Femme' THEN 1 ELSE 0 END) AS total_femmes_conjoint,
  
        -- Comptage des enfants
        (SELECT COUNT(*) FROM Enfants e WHERE e.id_travailleur = t.id_travailleur AND e.sexe_enfant = 'Homme') AS total_hommes_enfants,
        (SELECT COUNT(*) FROM Enfants e WHERE e.id_travailleur = t.id_travailleur AND e.sexe_enfant = 'Femme') AS total_femmes_enfants,
  
        -- Total des hommes
        (
          SUM(CASE WHEN t.sexe_travailleur = 'Homme' THEN 1 ELSE 0 END) +
          SUM(CASE WHEN c.sexe_conjoint = 'Homme' THEN 1 ELSE 0 END) +
          (SELECT COUNT(*) FROM Enfants e WHERE e.id_travailleur = t.id_travailleur AND e.sexe_enfant = 'Homme')
        ) AS total_hommes,
  
        -- Total des femmes
        (
          SUM(CASE WHEN t.sexe_travailleur = 'Femme' THEN 1 ELSE 0 END) +
          SUM(CASE WHEN c.sexe_conjoint = 'Femme' THEN 1 ELSE 0 END) +
          (SELECT COUNT(*) FROM Enfants e WHERE e.id_travailleur = t.id_travailleur AND e.sexe_enfant = 'Femme')
        ) AS total_femmes,
  
        -- Total des personnes (hommes et femmes)
        (
          (
            SUM(CASE WHEN t.sexe_travailleur = 'Homme' THEN 1 ELSE 0 END) +
            SUM(CASE WHEN c.sexe_conjoint = 'Homme' THEN 1 ELSE 0 END) +
            (SELECT COUNT(*) FROM Enfants e WHERE e.id_travailleur = t.id_travailleur AND e.sexe_enfant = 'Homme')
          ) +
          (
            SUM(CASE WHEN t.sexe_travailleur = 'Femme' THEN 1 ELSE 0 END) +
            SUM(CASE WHEN c.sexe_conjoint = 'Femme' THEN 1 ELSE 0 END) +
            (SELECT COUNT(*) FROM Enfants e WHERE e.id_travailleur = t.id_travailleur AND e.sexe_enfant = 'Femme')
          )
        ) AS total_personnes
      FROM travailleur t
      LEFT JOIN Conjoint c ON t.id_travailleur = c.id_travailleur
      WHERE t.id_travailleur = ?;
    `;
  
    db.query(query, [id_travailleur], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        return;
      }
  
      // Vérifier s'il y a des résultats
      if (results.length > 0) {
        res.json(results[0]); // Retourner le premier résultat (car GROUP BY id_travailleur)
      } else {
        res.status(404).json({ error: 'Travailleur non trouvé' });
      }
    });
  });
  


export default router;