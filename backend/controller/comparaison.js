import express from 'express';
import mysql from 'mysql2/promise'; 

const router = express.Router();

// Configuration de la connexion MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stage'
});

// Route pour comparer les noms et prénoms et récupérer les enregistrements complets
router.get('/nom_comparaison', async (req, res) => {
    try {
        // Étape 1: Récupérer les doublons de noms et prénoms avec leurs IDs
        const [duplicateNames] = await db.query(`
            SELECT nom, GROUP_CONCAT(id SEPARATOR ', ') AS ids, COUNT(*) AS occurences
            FROM (
                SELECT nom_travailleur AS nom, id_travailleur AS id FROM travailleur
                UNION ALL
                SELECT prenom_travailleur AS nom, id_travailleur AS id FROM travailleur
                UNION ALL
                SELECT nom_conjoint AS nom, id_conjoint AS id FROM Conjoint
                UNION ALL
                SELECT prenom_conjoint AS nom, id_conjoint AS id FROM Conjoint
                UNION ALL
                SELECT nom_enfant AS nom, id_enfant AS id FROM Enfants
                UNION ALL
                SELECT prenom_enfant AS nom, id_enfant AS id FROM Enfants
            ) AS noms_prenoms_combines
            GROUP BY nom
            HAVING COUNT(*) > 1;
        `);

        if (duplicateNames.length === 0) {
            return res.status(404).json({ message: "Aucun doublon trouvé" });
        }

        // Étape 2: Récupérer les enregistrements complets par les IDs
        const allIds = [];
        duplicateNames.forEach(row => {
            const ids = row.ids.split(', ').map(id => id.trim());
            allIds.push(...ids);
        });

        // Récupérer les enregistrements complets pour chaque table
        let travailleurs = [], conjoints = [], enfants = [];

        if (allIds.length > 0) {
            // Récupérer les enregistrements des travailleurs, conjoints et enfants basés sur les IDs
            [travailleurs] = await db.query(`
                SELECT id_travailleur AS id,
                  nom_travailleur AS nom,
                  prenom_travailleur AS prenom,
                  cin_travailleur AS cin,
                  age_travailleur AS age,
                  sexe_travailleur AS sexe,
                  imageUrl_travailleur AS image,
                  'Travailleur' AS role
                FROM travailleur
                WHERE id_travailleur IN (?);
            `, [allIds]);

            [conjoints] = await db.query(`
              SELECT 
                  conjoint.id_conjoint AS id, 
                  conjoint.nom_conjoint AS nom, 
                  conjoint.prenom_conjoint AS prenom, 
                  conjoint.cin_conjoint AS cin, 
                  conjoint.age_conjoint AS age, 
                  conjoint.sexe_conjoint AS sexe, 
                  conjoint.imageUrl_conjoint AS image,
                  travailleur.nom_travailleur AS nom_travailleur, 
                  travailleur.prenom_travailleur AS prenom_travailleur,
                  'conjoint' AS role
              FROM Conjoint AS conjoint
              JOIN travailleur ON conjoint.id_travailleur = travailleur.id_travailleur
              WHERE conjoint.id_conjoint IN (?);
          `, [allIds]);
          

          [enfants] = await db.query(`
            SELECT 
                enfant.id_enfant AS id, 
                enfant.nom_enfant AS nom, 
                enfant.prenom_enfant AS prenom, 
                enfant.cin_enfant AS cin, 
                enfant.age_enfant AS age, 
                enfant.sexe_enfant AS sexe, 
                enfant.imageUrl_enfant AS image,
                travailleur.nom_travailleur AS nom_travailleur,
                travailleur.prenom_travailleur AS prenom_travailleur, 
                'enfant' AS role
            FROM Enfants AS enfant
            JOIN travailleur ON enfant.id_travailleur = travailleur.id_travailleur
            WHERE enfant.id_enfant IN (?);
        `, [allIds]);
        
        }

        // Répondre avec les enregistrements complets
        res.json({
            duplicateNames,
            travailleurs,
            conjoints,
            enfants
        });

    } catch (error) {
        console.error("Erreur lors de la comparaison des noms:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


router.post('/get_details_by_ids', async (req, res) => {
    const { ids } = req.body;
  
    try {
      if (!ids || ids.length === 0) {
        return res.status(400).json({ message: "Aucun ID fourni" });
      }

      // Séparer les ids en groupes (travailleur, conjoint, enfant)
      const travailleurIds = [];
      const conjointIds = [];
      const enfantIds = [];

      ids.forEach(id => {
        if (id.startsWith('travailleur')) travailleurIds.push(id);
        else if (id.startsWith('conjoint')) conjointIds.push(id);
        else if (id.startsWith('enfant')) enfantIds.push(id);
      });

      let details = [];

      // Récupérer les détails pour les travailleurs si des ids existent
      if (travailleurIds.length > 0) {
        const [travailleurs] = await db.query(`
          SELECT id_travailleur AS id, nom_travailleur AS nom, prenom_travailleur AS prenom, cin_travailleur AS cin, age_travailleur AS age, imageUrl_travailleur AS image
          FROM travailleur
          WHERE id_travailleur IN (?);
        `, [travailleurIds]);

        details = details.concat(travailleurs);
      }

      // Récupérer les détails pour les conjoints si des ids existent
      if (conjointIds.length > 0) {
        const [conjoints] = await db.query(`
          SELECT id_conjoint AS id, nom_conjoint AS nom, prenom_conjoint AS prenom, cin_conjoint AS cin, age_conjoint AS age, imageUrl_conjoint AS image
          FROM Conjoint
          WHERE id_conjoint IN (?);
        `, [conjointIds]);

        details = details.concat(conjoints);
      }

      // Récupérer les détails pour les enfants si des ids existent
      if (enfantIds.length > 0) {
        const [enfants] = await db.query(`
          SELECT id_enfant AS id, nom_enfant AS nom, prenom_enfant AS prenom, cin_enfant AS cin, age_enfant AS age, imageUrl_enfant AS image
          FROM Enfants
          WHERE id_enfant IN (?);
        `, [enfantIds]);

        details = details.concat(enfants);
      }

      // Retourner les détails
      res.json(details);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      res.status(500).send('Erreur du serveur');
    }
});

  

export default router;
