import dotenv from 'dotenv';
dotenv.config();
import express from 'express'; // Example, replace with your actual imports
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise'; 

// Configuration de la connexion à la base de données
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stage'
  });

const router = express.Router();
  

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route Signup
router.post('/', async (req, res) => {
    const { email, password, nom_travailleur, codeMenage,  } = req.body; // Mise à jour pour utiliser codeMenage
    console.log(req.body);

    try {
        // Vérification si l'utilisateur existe déjà
        const [emailRows] = await db.query('SELECT * FROM travailleur WHERE email_travailleur = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ message: 'Cet e-mail est déjà utilisé' });
        }

        // Vérification si le codeMenage existe déjà
        const [codeMenageRows] = await db.query('SELECT * FROM travailleur WHERE codeMenage = ?', [codeMenage]);
        if (codeMenageRows.length > 0) {
            return res.status(400).json({ message: 'Ce code de ménage est déjà utilisé' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Génération d'un code de validation à 6 chiffres
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // Correction de la plage à 6 chiffres

        // Insérer le nouvel utilisateur dans la base de données avec un code de validation
        await db.query(
            'INSERT INTO travailleur (email_travailleur, password_travailleur, verification_code, is_verified, nom_travailleur, codeMenage) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, verificationCode, false, nom_travailleur, codeMenage] // Ajout des nouveaux champs
        );

        // Sending an email with the verification code
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Vérifier votre Compte ✔',
            html: `Your verification code is: <strong>${verificationCode}</strong>`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email de validation.' });
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.json({ message: 'Inscription réussie. Veuillez vérifier votre e-mail pour le code de validation.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour vérifier le code de validation
router.post('/verify', async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
      // Vérification du code de validation
      const [rows] = await db.query(
          'SELECT * FROM travailleur WHERE email_travailleur = ? AND verification_code = ?',
          [email, verificationCode]
      );

      if (rows.length === 0) {
          return res.status(400).json({ message: 'Code de validation incorrect ou email non trouvé.' });
      }

      const user = rows[0]; // Récupérer les détails du travailleur

      // Mise à jour de l'utilisateur pour marquer l'email comme vérifié
      await db.query(
          'UPDATE travailleur SET is_verified = ? WHERE email_travailleur = ?',
          [true, email]
      );

      // Génération du JWT Token
      const token = jwt.sign({ userId: user.id_travailleur, email: user.email_travailleur }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Répondre avec un message de succès, le token et l'id_travailleur
      res.json({
          message: 'Compte vérifié avec succès !',
          token,   // Retourner le token
          user: { id_travailleur: user.id_travailleur } // Retourner l'id_travailleur
      });
  } catch (error) {
      console.error('Erreur lors de la vérification du compte:', {
          message: error.message,
          code: error.code, // Si c'est applicable
          sqlMessage: error.sqlMessage, // Si c'est applicable
      });
      res.status(500).json({ message: 'Erreur serveur lors de la vérification.' });
  }
});



// Route Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Vérification si l'utilisateur existe
      const [rows] = await db.query('SELECT * FROM travailleur WHERE email_travailleur = ?', [email]);
      if (rows.length === 0) {
          return res.status(400).json({ message: 'Email non trouvé' });
      }

      const user = rows[0];

      // Vérification si l'utilisateur a vérifié son email
      if (!user.is_verified) {
          return res.status(400).json({ message: 'Veuillez vérifier votre e-mail avant de vous connecter' });
      }

      // Comparaison du mot de passe
      const isMatch = await bcrypt.compare(password, user.password_travailleur);
      if (!isMatch) {
          return res.status(400).json({ message: 'Mot de passe incorrect' });
      }

      // Génération du JWT Token après validation réussie
      const token = jwt.sign(
          { userId: user.id_travailleur, email: user.email_travailleur },  // Payload avec ID et email
          process.env.JWT_SECRET,  // Clé secrète utilisée pour signer le token
          { expiresIn: '1h' }
      );

      // Renvoi du token et de l'ID au client
      res.json({ token, id_travailleur: user.id_travailleur });
      console.log(user)
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Route pour envoyer un email de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Vérifier si l'utilisateur existe avec cet email
      const [userRows] = await db.query('SELECT * FROM travailleur WHERE email_travailleur = ?', [email]);
  
      if (userRows.length === 0) {
        return res.status(404).json({ message: "Cet email n'existe pas." });
      }
  
      const user = userRows[0];
  
      // Générer un token JWT pour la réinitialisation du mot de passe
      const resetToken = jwt.sign({ userId: user.id_travailleur, email: user.email_travailleur }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Lien de réinitialisation
      const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
  
      // Envoyer l'email de réinitialisation
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialisez votre mot de passe',
        text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
        }
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Email de réinitialisation envoyé. Veuillez vérifier votre boîte de réception.' });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la réinitialisation du mot de passe.' });
    }
  });

  // Route pour réinitialiser le mot de passe reset-password
  router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    try {
      // Vérifier le token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Mettre à jour le mot de passe dans la base de données
      const [rows] = await db.query(
        'UPDATE travailleur SET password_travailleur = ? WHERE id_travailleur = ?',
        [hashedPassword, decoded.userId]
      );

      // Vérification si l'utilisateur a été mis à jour
      if (rows.affectedRows === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      // Génération d'un nouveau token JWT après réinitialisation
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email }, // Payload
        process.env.JWT_SECRET,  // Clé secrète pour signer le token
        { expiresIn: '1h' }  // Durée de validité du token
      );

      // Renvoi du token au client après succès
      res.json({ message: 'Mot de passe réinitialisé avec succès.', token: newToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lien invalide ou expiré.' });
    }
  });

  router.post('/checkCode', async (req, res) => {
    const { codeMenage } = req.body;

    if (!codeMenage) {
        return res.status(400).json({ message: "Le code ménage est requis." });
    }

    try {
        const query = 'SELECT * FROM excel WHERE num_ménage = ?';
        db.query(query, [codeMenage], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur serveur lors de la validation." });
            }

            if (result.length > 0) {
                res.status(200).json({ message: "Code ménage valide." });
            } else {
                res.status(400).json({ message: "Code ménage introuvable. Veuillez contacter le responsable." });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

router.get('/nomTravailleur', async (req, res) => {
  const { codeMenage } = req.query;

  try {
      const [rows] = await db.query(
          'SELECT nom_travailleur FROM excel WHERE num_ménage = ?',
          [codeMenage]
      );

      if (rows.length === 0) {
          return res.status(404).json({ message: 'Aucun travailleur trouvé pour ce numéro de ménage.' });
      }

      res.status(200).json({ nom_travailleur: rows[0].nom_travailleur });
  } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
  }
});
  




export default router;
