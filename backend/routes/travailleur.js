import express from 'express';
import mysql from 'mysql2/promise'; 
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configuration de la connexion MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stage'
});

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'backend/uploads/travailleur');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Route pour ajouter un travailleur
router.post('/addTravailleur', upload.single('imageUrl_travailleur'), async (req, res) => {
    try {
        console.log(req.body);  // Display body data for debugging
        console.log(req.file);  // Display file data for debugging

        // Verify if email already exists
        const [emailRows] = await db.query('SELECT * FROM travailleur WHERE email_travailleur = ?', [req.body.email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ message: 'Cet e-mail est déjà utilisé' });
        }

        // Verify if the household code (codeMenage) already exists
        const [codeMenageRows] = await db.query('SELECT * FROM travailleur WHERE codeMenage = ?', [req.body.codeMenage]);
        if (codeMenageRows.length > 0) {
            return res.status(400).json({ message: 'Ce code de ménage est déjà utilisé' });
        }

        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000); 

        // Construct image URL if file is uploaded
        const imageUrl_travailleur = req.file ? `backend/uploads/travailleur/${req.file.filename}` : null;

        // Insert new worker (travailleur) into the database
        const insertQuery = `INSERT INTO travailleur 
            (email_travailleur, password_travailleur, is_verified, verification_code, nom_travailleur, codeMenage, imageUrl_travailleur, sexe_travailleur, age_travailleur, cin_travailleur, prenom_travailleur) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

        const values = [
            req.body.email,
            hashedPassword,
            false,
            verificationCode,
            req.body.nom_travailleur,
            req.body.codeMenage,
            imageUrl_travailleur,
            req.body.selectedRole, 
            req.body.age_travailleur,
            req.body.cin_travailleur,
            req.body.prenom_travailleur
        ];

        await db.query(insertQuery, values);

        // Send verification email with the code
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Vérifiez votre compte ✔', // Correction ici
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                    <h2 style="color: #333;">Vérification du compte</h2>
                    <p style="color: #555;">Pour vérifier votre compte, veuillez utiliser le code suivant :</p>
                    <p style="font-size: 24px; font-weight: bold; color: #007BFF;">${verificationCode}</p>
                    <p style="color: #555;">Merci de vous joindre à nous !</p>
                    <p style="color: #777;">Si vous ne l'avez pas demandé, veuillez ignorer cet e-mail.</p>
                </div>
            `
        };

        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Erreur lors de l'envoi de l'email: ", err);
                return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email de validation.' });
            } else {
                console.log('Email envoyé: ' + info.response);
            }
        });

        res.json({ message: 'Inscription réussie. Veuillez vérifier votre e-mail pour le code de validation.' });

    } catch (error) {
        console.error("Erreur serveur: ", error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Dans votre code serveur (par exemple, avec Express)

router.post('/validate', async (req, res) => {
    const { email, codeMenage} = req.body;
    
    try {
        // Vérification si l'email existe déjà
        const [emailRows] = await db.query('SELECT * FROM travailleur WHERE email_travailleur = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ message: 'Cet e-mail est déjà utilisé' });
        }

        // Vérification si le code ménage existe déjà
        const [codeMenageRows] = await db.query('SELECT * FROM travailleur WHERE codeMenage = ?', [codeMenage]);
        if (codeMenageRows.length > 0) {
            return res.status(400).json({ message: 'Ce code de ménage est déjà utilisé' });
        }

         
        // Si aucune des vérifications ne trouve de doublons, continuez avec le processus d'inscription
        res.status(200).json({ message: 'Validation réussie. Vous pouvez continuer.' });
    } catch (error) {
        console.error("Erreur serveur: ", error);
        res.status(500).json({ message: 'Erreur serveur lors de la validation.' });
    }
});

router.post('/validate2', async (req, res) => {
    const { cin_travailleur, age_travailleur } = req.body;

    try {
        // Vérification de la longueur du CIN (doit contenir exactement 12 chiffres)
        if (!/^\d{12}$/.test(cin_travailleur)) {
            return res.status(400).json({ message: 'Le CIN doit contenir exactement 12 chiffres' });
        }

        // Vérification si le CIN existe déjà
        const [cinRows] = await db.query(`
            SELECT cin_travailleur FROM travailleur WHERE cin_travailleur = ? 
            UNION 
            SELECT cin_conjoint FROM conjoint WHERE cin_conjoint = ?
            UNION
            SELECT cin_enfant FROM enfants WHERE cin_enfant = ?`, 
            [cin_travailleur, cin_travailleur, cin_travailleur]
        );
        
        if (cinRows.length > 0) {
            return res.status(400).json({ message: 'Ce CIN est déjà utilisé' });
        }

        // Vérifiez que l'âge du travailleur est raisonnable
        const currentDate = new Date();
        const birthDate = new Date(age_travailleur);
        const age = currentDate.getFullYear() - birthDate.getFullYear();

        if (age > 120 || age < 18) {  // L'âge doit être entre 18 et 120 ans
            return res.status(400).json({ message: 'L\'âge du travailleur doit être compris entre 18 et 120 ans.' });
        }

        // Si aucune des vérifications ne trouve de problèmes, continuez avec le processus d'inscription
        res.status(200).json({ message: 'Validation réussie. Vous pouvez continuer.' });

    } catch (error) {
        console.error("Erreur serveur: ", error);
        res.status(500).json({ message: 'Erreur serveur lors de la validation.' });
    }
});

// Route pour récupérer le rôle d'un travailleur
router.get('/role/:id_travailleur', async (req, res) => {
    try {
        const { id_travailleur } = req.params;
        const [result] = await db.query('SELECT role FROM travailleur WHERE id_travailleur = ?', [id_travailleur]);
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: 'Travailleur non trouvé' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Oups! Erreur lors de la récupération du rôle : ' + err });
    }
});


// Route pour récupérer tous les travailleurs
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM travailleur');
        res.json(result);
    } catch (err) {
        res.status(500).json({ Message: 'Oups! SELECT utilisateur non réussi: ' + err });
    }
});

// Route pour récupérer à propos  nom travailleur
router.get('/selectionner_travailleur', (req, res) => {
    const sql = 'SELECT id_travailleur, nom_travailleur, prenom_travailleur, codeMenage  FROM Travailleur';
    db.query(sql, (err, result) => {
      if (err) return res.json({ error: 'Erreur lors de la récupération des Utilisateurs' });
      return res.json(result);
    });
  });


// Route pour supprimer un travailleur
router.delete('/supprimerTravailleur/:id_travailleur', async (req, res) => {
    try {
        const id_travailleur = req.params.id_travailleur;
        const sql = 'DELETE FROM travailleur WHERE id_travailleur = ?';
        const [result] = await db.query(sql, [id_travailleur]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ Message: 'Travailleur non trouvé' });
        }

        return res.status(200).json({ Message: 'Suppression travailleur réussie' });
    } catch (err) {
        return res.status(500).json({ Message: 'Oups! DELETE travailleur non réussi: ' + err });
    }
});


router.get('/:id_travailleur', async (req, res) => {
    try {
        const id_travailleur = req.params.id_travailleur; // Récupérer l'ID du travailleur
        const [result] = await db.query('SELECT * FROM travailleur WHERE id_travailleur = ?', [id_travailleur]); // Passer l'ID dans le tableau de paramètres
        if (result.length === 0) {
            return res.status(404).json({ Message: "Travailleur non trouvé" });
        }
        res.json(result[0]); // Retourner le premier résultat
    } catch (err) {
        res.status(500).json({ Message: 'Oups! SELECT utilisateur non réussi: ' + err.message });
    }
});

router.put('/modifierTravailleur/:id_travailleur', async (req, res) => {
    const id_travailleur = req.params.id_travailleur;
    const { codeMenage, nom_travailleur, sexe_travailleur, cin_travailleur, role, vivant, age_travailleur, prenom_travailleur } = req.body;

    try {
       
        const sql = 'UPDATE travailleur SET codeMenage = ?, nom_travailleur = ?, sexe_travailleur = ?, cin_travailleur = ?, role = ?, vivant=?, age_travailleur=?, prenom_travailleur=? WHERE id_travailleur = ?';
        await db.query(sql, [codeMenage, nom_travailleur, sexe_travailleur, cin_travailleur, role, vivant, age_travailleur,prenom_travailleur, id_travailleur]);
        return res.json({ message: "Modification Utilisateur réussie" });
    } catch (err) {
        return res.status(500).json({ message: "Erreur lors de la modification des données d'un utilisateur", error: err });
    }
});


router.get('/profil/:id_travailleur', async (req, res) => {
    const id_travailleur = req.params.id_travailleur;

    const sql = `
    SELECT 
        t.id_travailleur,
        t.codeMenage,
        t.nom_travailleur,
        t.prenom_travailleur,
        t.sexe_travailleur,
        t.age_travailleur,
        t.cin_travailleur,
        t.imageUrl_travailleur,
        t.role,
        t.vivant,
        c.id_conjoint,
        c.nom_conjoint,
        c.prenom_conjoint,
        c.sexe_conjoint,
        c.age_conjoint,
        c.cin_conjoint,
        c.imageUrl_conjoint,
        e.id_enfant,
        e.nom_enfant,
        e.prenom_enfant,
        e.sexe_enfant,
        e.age_enfant,
        e.cin_enfant,
        e.imageUrl_enfant,
        r.id_remplacant,
        CASE 
            WHEN r.is_self_replacement = TRUE THEN 'Self'
            ELSE IFNULL(co.nom_conjoint, en.nom_enfant)
        END AS nom_remplacant,
        CASE 
            WHEN r.is_self_replacement = TRUE THEN 'Self'
            ELSE IFNULL(co.prenom_conjoint, en.prenom_enfant)
        END AS prenom_remplacant,
        CASE
            WHEN r.is_self_replacement = TRUE THEN 'Self'
            WHEN r.conjointId IS NOT NULL THEN 'Conjoint'
            WHEN r.enfantId IS NOT NULL THEN 'Enfant'
        END AS relation_remplacant
    FROM 
        travailleur t
    LEFT JOIN 
        Conjoint c ON t.id_travailleur = c.id_travailleur
    LEFT JOIN 
        Enfants e ON t.id_travailleur = e.id_travailleur
    LEFT JOIN 
        Remplacant r ON r.id_travailleur = t.id_travailleur
    LEFT JOIN 
        Conjoint co ON r.conjointId = co.id_conjoint
    LEFT JOIN 
        Enfants en ON r.enfantId = en.id_enfant
    WHERE 
        t.id_travailleur = ?`;

    try {
        const [result] = await db.query(sql, [id_travailleur]);  // Utilisation directe de mysql2/promise

        if (result.length === 0) {
            return res.status(404).json({ Message: "Aucun travailleur trouvé avec cet ID." });
        }

        const data = {
            id_travailleur: result[0].id_travailleur,
            codeMenage: result[0].codeMenage,
            nom_travailleur: result[0].nom_travailleur,
            prenom_travailleur: result[0].prenom_travailleur,
            sexe_travailleur: result[0].sexe_travailleur,
            age_travailleur: result[0].age_travailleur,
            cin_travailleur: result[0].cin_travailleur,
            imageUrl_travailleur: result[0].imageUrl_travailleur,
            role: result[0].role,
            vivant: result[0].vivant,
            conjoints: [],
            enfants: [],
            remplacant: {
                id_remplacant: result[0].id_remplacant,
                nom_remplacant: result[0].nom_remplacant,
                prenom_remplacant: result[0].prenom_remplacant,
                relation_remplacant: result[0].relation_remplacant
            }
        };

        const conjointsSet = new Set();
        const enfantsSet = new Set();

        result.forEach(row => {
            if (row.id_conjoint && !conjointsSet.has(row.id_conjoint)) {
                data.conjoints.push({
                    id_conjoint: row.id_conjoint,
                    nom_conjoint: row.nom_conjoint,
                    prenom_conjoint: row.prenom_conjoint,
                    sexe_conjoint: row.sexe_conjoint,
                    age_conjoint: row.age_conjoint,
                    cin_conjoint: row.cin_conjoint,
                    imageUrl_conjoint: row.imageUrl_conjoint,
                });
                conjointsSet.add(row.id_conjoint);
            }
            if (row.id_enfant && !enfantsSet.has(row.id_enfant)) {
                data.enfants.push({
                    id_enfant: row.id_enfant,
                    nom_enfant: row.nom_enfant,
                    prenom_enfant: row.prenom_enfant,
                    sexe_enfant: row.sexe_enfant,
                    age_enfant: row.age_enfant,
                    cin_enfant: row.cin_enfant,
                    imageUrl_enfant: row.imageUrl_enfant,
                });
                enfantsSet.add(row.id_enfant);
            }
        });

        return res.json(data);
    } catch (err) {
        return res.status(500).json({ Message: "Erreur lors de la récupération des données d'un utilisateur", error: err });
    }
});

router.get('/famille/:id_travailleur', async (req, res) => {
    const { id_travailleur } = req.params;

    const sql = `
      SELECT 
        t.id_travailleur,
        t.codeMenage,
        t.nom_travailleur,
        t.prenom_travailleur,
        t.sexe_travailleur,
        t.age_travailleur,
        t.cin_travailleur,
        t.imageUrl_travailleur,
        t.role,
        c.id_conjoint,
        c.nom_conjoint,
        c.prenom_conjoint,
        c.sexe_conjoint,
        c.age_conjoint,
        c.cin_conjoint,
        c.imageUrl_conjoint,
        GROUP_CONCAT(e.id_enfant) AS ids_enfants,
        GROUP_CONCAT(e.nom_enfant) AS noms_enfants,
        GROUP_CONCAT(e.prenom_enfant) AS prenoms_enfants,
        GROUP_CONCAT(e.sexe_enfant) AS sexes_enfants,
        GROUP_CONCAT(e.age_enfant) AS ages_enfants,
        GROUP_CONCAT(e.cin_enfant) AS cins_enfants,
        GROUP_CONCAT(e.imageUrl_enfant) AS images_enfants
      FROM travailleur t
      LEFT JOIN conjoint c ON t.id_travailleur = c.id_travailleur
      LEFT JOIN enfants e ON t.id_travailleur = e.id_travailleur
      WHERE t.id_travailleur = ?
      GROUP BY t.id_travailleur, c.id_conjoint
    `;

    try {
        // Utilisation de `db.execute` au lieu de `db.query` avec `await`
        const [rows] = await db.execute(sql, [id_travailleur]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Travailleur non trouvé' });
        }

        const travailleur = {
            id: rows[0].id_travailleur,
            nom: rows[0].nom_travailleur,
            prenom: rows[0].prenom_travailleur,
            codeMenage: rows[0].codeMenage,
            sexe: rows[0].sexe_travailleur,
            age: rows[0].age_travailleur,
            cin: rows[0].cin_travailleur,
            imageUrl: rows[0].imageUrl_travailleur,
            role: rows[0].role
        };

        const conjoint = rows[0].id_conjoint ? {
            id: rows[0].id_conjoint,
            nom: rows[0].nom_conjoint,
            prenom: rows[0].prenom_conjoint,
            age: rows[0].age_conjoint,
            imageUrl: rows[0].imageUrl_conjoint,
            sexe: rows[0].sexe_conjoint,
            cin: rows[0].cin_conjoint
        } : null;

        // Récupérer les enfants sous forme d'objets
        const ids_enfants = rows[0].ids_enfants ? rows[0].ids_enfants.split(',') : [];
        const noms_enfants = rows[0].noms_enfants ? rows[0].noms_enfants.split(',') : [];
        const prenoms_enfants = rows[0].prenoms_enfants ? rows[0].prenoms_enfants.split(',') : [];
        const sexes_enfants = rows[0].sexes_enfants ? rows[0].sexes_enfants.split(',') : [];
        const ages_enfants = rows[0].ages_enfants ? rows[0].ages_enfants.split(',') : [];
        const cins_enfants = rows[0].cins_enfants ? rows[0].cins_enfants.split(',') : [];
        const images_enfants = rows[0].images_enfants ? rows[0].images_enfants.split(',') : [];

        const enfants = ids_enfants.map((id, index) => ({
            id,
            nom: noms_enfants[index],
            prenom: prenoms_enfants[index],
            sexe: sexes_enfants[index],
            age: ages_enfants[index],
            cin: cins_enfants[index],
            imageUrl: images_enfants[index]
        }));

        const famille = {
            travailleur,
            conjoint,
            enfants
        };

        return res.json(famille);
    } catch (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des informations du travailleur' });
    }
});


// Route pour obtenir la répartition des genres (travailleurs et conjoints)
router.get('/repartition_genres', (req, res) => {
    const query = `
        SELECT 'Travailleurs' AS categorie, sexe_travailleur AS sexe, COUNT(*) AS total
        FROM travailleur
        GROUP BY sexe_travailleur
        UNION
        SELECT 'Conjoints' AS categorie, sexe_conjoint AS sexe, COUNT(*) AS total
        FROM Conjoint
        GROUP BY sexe_conjoint
    `;
    db.query(query, (err, result) => {
        if (err) {
            console.error('SQL Error: ', err);
            return res.status(500).json({ error: "Database query failed", details: err });
        }
        if (result.length === 0) {
            console.log('Aucun résultat trouvé pour la répartition des genres');
        } else {
            console.log(result); // Log des résultats dans la console
        }
        res.json(result);
    });
});



// Route pour obtenir la distribution des âges
router.get('/distribution_ages',async (req, res) => {
    const query = `
        SELECT 'Travailleurs' AS categorie, age_travailleur AS age, COUNT(*) AS total
        FROM travailleur
        GROUP BY age_travailleur
        UNION
        SELECT 'Conjoints' AS categorie, age_conjoint AS age, COUNT(*) AS total
        FROM Conjoint
        GROUP BY age_conjoint
        UNION
        SELECT 'Enfants' AS categorie, age_enfant AS age, COUNT(*) AS total
        FROM Enfants
        GROUP BY age_enfant;
    `;
    db.query(query, (err, results) => {
        if (err) throw err;
        console.log(results); // Log du résultat complet
        res.json(results || []); // Renvoi d'un tableau vide si aucun résultat
    });
});


// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(403).send('A token is required for authentication');
    }
  
    try {
      const bearerToken = token.split(' ')[1]; // Supprimer le préfixe 'Bearer'
      const decoded = jwt.verify(bearerToken, '3!pErSeCrVanoZETEEtKEy@2024!Abc#987');
      req.user = decoded; // Attacher l'ID utilisateur au req.user
      next();
    } catch (err) {
      return res.status(401).send('Invalid Token');
    }
  };
  
// Endpoint pour récupérer les informations de l'utilisateur (travailleur et famille)
router.get('/propos/:id_travailleur', async (req, res) => {
    const { id_travailleur } = req.params; 
    console.log('id_travailleur:', id_travailleur); 

    try {
        const sql = `
            SELECT 
              t.id_travailleur,
              t.nom_travailleur,
              t.prenom_travailleur,
              t.codeMenage,
              COUNT(DISTINCT t.id_travailleur) AS travailleur_count,
              COUNT(DISTINCT c.id_conjoint) AS conjoint_count,
              COUNT(e.id_enfant) AS enfants_count,
              (COUNT(DISTINCT t.id_travailleur) + COUNT(DISTINCT c.id_conjoint) + COUNT(e.id_enfant)) AS total_membres_famille,
              COALESCE(conjoint.nom_conjoint, enfant.nom_enfant, 'Aucun remplaçant') AS nom_remplacant
            FROM travailleur t
            LEFT JOIN Conjoint c ON t.id_travailleur = c.id_travailleur
            LEFT JOIN Enfants e ON t.id_travailleur = e.id_travailleur
            LEFT JOIN Remplacant r ON t.id_travailleur = r.id_travailleur
            LEFT JOIN Conjoint conjoint ON r.conjointId = conjoint.id_conjoint
            LEFT JOIN Enfants enfant ON r.enfantId = enfant.id_enfant
            WHERE t.id_travailleur = ?
            GROUP BY t.id_travailleur;
        `;

        const [result] = await db.query(sql, [id_travailleur]);
        console.log('Résultat de la requête SQL:', result);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Travailleur non trouvé' });
        }

        const travailleur = result[0]; 
        res.status(200).json({
            travailleur_id: travailleur.id_travailleur,
            nom_travailleur: travailleur.nom_travailleur,
            prenom_travailleur: travailleur.prenom_travailleur,
            codeMenage: travailleur.codeMenage,
            conjoint_count: travailleur.conjoint_count,
            enfants_count: travailleur.enfants_count,
            total_membres_famille: travailleur.total_membres_famille,
            nom_remplacant: travailleur.nom_remplacant, 
        });
    } catch (error) {
        console.error('Erreur serveur', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
export default router;
