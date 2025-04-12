USE sql8748193;

-- Table Travailleur avec les colonnes supplémentaires pour l'inscription
CREATE TABLE travailleur (
  id_travailleur CHAR(36) PRIMARY KEY, 
  codeMenage INT UNIQUE NOT NULL,
  nom_travailleur VARCHAR(255) NOT NULL,
  prenom_travailleur VARCHAR(255) NOT NULL,
  sexe_travailleur ENUM('HOMME', 'FEMME') NOT NULL,
  age_travailleur DATE,
  cin_travailleur DOUBLE UNIQUE NOT NULL,
  imageUrl_travailleur VARCHAR(255),
  role ENUM('SIMPLE', 'ADMINISTRATEUR') NOT NULL,
  email_travailleur VARCHAR(255) UNIQUE NOT NULL,
  password_travailleur VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code INT,
  code_expires_at DATETIME,
  reset_token VARCHAR(255),
  reset_token_expires_at DATETIME
);


-- Table Conjoint
CREATE TABLE conjoint (
  id_conjoint CHAR(36) PRIMARY KEY, 
  nom_conjoint VARCHAR(255) NOT NULL,
  prenom_conjoint VARCHAR(255) NOT NULL,
  sexe_conjoint ENUM('HOMME', 'FEMME') NOT NULL,
  age_conjoint Date,
  cin_conjoint DOUBLE UNIQUE NOT NULL,
  imageUrl_conjoint VARCHAR(255),
  id_travailleur CHAR(36), 
  CONSTRAINT fk_travailleur_conjoint
  FOREIGN KEY (id_travailleur) REFERENCES travailleur(id_travailleur)
  ON DELETE CASCADE
);

-- Table Enfants
CREATE TABLE enfants (
  id_enfant CHAR(36) PRIMARY KEY, 
  nom_enfant VARCHAR(255) NOT NULL,
  prenom_enfant VARCHAR(255) NOT NULL,
  sexe_enfant ENUM('HOMME', 'FEMME') NOT NULL,
  age_enfant Date,
  cin_enfant DOUBLE  NOT NULL,
  imageUrl_enfant VARCHAR(255),
  id_travailleur CHAR(36), 
  CONSTRAINT fk_travailleur_enfant
  FOREIGN KEY (id_travailleur) REFERENCES travailleur(id_travailleur)
  ON DELETE CASCADE
);

-- Table Remplacant corrigée
CREATE TABLE remplacant (
  id_remplacant CHAR(36) PRIMARY KEY, 
  id_travailleur CHAR(36), 
  conjointId CHAR(36), 
  enfantId CHAR(36), 
  is_self_replacement BOOLEAN DEFAULT FALSE, 
  CONSTRAINT fk_travailleur_remplacant
  FOREIGN KEY (id_travailleur) REFERENCES travailleur(id_travailleur)
  ON DELETE CASCADE,
  CONSTRAINT fk_conjoint_remplacant
  FOREIGN KEY (conjointId) REFERENCES Conjoint(id_conjoint)
  ON DELETE CASCADE,
  CONSTRAINT fk_enfant_remplacant
  FOREIGN KEY (enfantId) REFERENCES Enfants(id_enfant)
  ON DELETE CASCADE
);

CREATE TABLE excel (
    id INT(10) AUTO_INCREMENT NOT NULL,
    num_ménage VARCHAR(50) NOT NULL,
    nom_chef_ménage VARCHAR(100) NOT NULL,
    statut VARCHAR(100),
    récepteur_transfert VARCHAR(100),
    sexe VARCHAR(10),
    cin_récepteur VARCHAR(20),
    nom_travailleur VARCHAR(100),
    remplaçant VARCHAR(100),
    groupe_critere VARCHAR(255),
    direction VARCHAR(255),
    region VARCHAR(255),
    district VARCHAR(255),
    commune VARCHAR(255),
    fokontany VARCHAR(255),
    mère VARCHAR(255),
    PRIMARY KEY (id)
);
