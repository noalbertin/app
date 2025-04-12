

-- Base de données : `stage`
--

-- --------------------------------------------------------

--
-- Structure de la table `conjoint`
--

CREATE TABLE `conjoint` (
  `id_conjoint` char(36) NOT NULL DEFAULT uuid(),
  `nom_conjoint` varchar(255) NOT NULL,
  `sexe_conjoint` enum('HOMME','FEMME') NOT NULL,
  `age_conjoint` date NOT NULL,
  `cin_conjoint` double NOT NULL,
  `imageUrl_conjoint` varchar(255) DEFAULT NULL,
  `id_travailleur` char(36) DEFAULT NULL,
  `prenom_conjoint` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- --------------------------------------------------------

--
-- Structure de la table `enfants`


CREATE TABLE `enfants` (
  `id_enfant` char(36) NOT NULL DEFAULT uuid(),
  `nom_enfant` varchar(255) NOT NULL,
  `sexe_enfant` enum('HOMME','FEMME') NOT NULL,
  `age_enfant` date NOT NULL,
  `cin_enfant` double NOT NULL,
  `imageUrl_enfant` varchar(255) DEFAULT NULL,
  `id_travailleur` char(36) DEFAULT NULL,
  `prenom_enfant` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- --------------------------------------------------------

--
-- Structure de la table `excel`
--

CREATE TABLE `excel` (
  `id` int(100) NOT NULL,
  `num_ménage` varchar(50) NOT NULL,
  `nom_chef_ménage` varchar(100) NOT NULL,
  `statut` varchar(100) DEFAULT NULL,
  `récepteur_transfert` varchar(100) DEFAULT NULL,
  `sexe` varchar(10) DEFAULT NULL,
  `cin_récepteur` varchar(20) DEFAULT NULL,
  `nom_travailleur` varchar(100) DEFAULT NULL,
  `remplaçant` varchar(100) DEFAULT NULL,
  `groupe_critere` varchar(255) DEFAULT NULL,
  `direction` varchar(255) DEFAULT NULL,
  `region` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `commune` varchar(255) DEFAULT NULL,
  `fokontany` varchar(255) DEFAULT NULL,
  `mère` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--------------------------------------------------------

--
-- Structure de la table `remplacant`
--

CREATE TABLE `remplacant` (
  `id_remplacant` char(36) NOT NULL DEFAULT uuid(),
  `id_travailleur` char(36) DEFAULT NULL,
  `conjointId` char(36) DEFAULT NULL,
  `enfantId` char(36) DEFAULT NULL,
  `is_self_replacement` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `remplacant`

-- --------------------------------------------------------

--
-- Structure de la table `travailleur`
--

CREATE TABLE `travailleur` (
  `id_travailleur` char(36) NOT NULL DEFAULT uuid(),
  `codeMenage` bigint(20) UNSIGNED DEFAULT NULL,
  `nom_travailleur` varchar(255) NOT NULL,
  `sexe_travailleur` enum('HOMME','FEMME') NOT NULL,
  `age_travailleur` date NOT NULL,
  `cin_travailleur` double DEFAULT NULL,
  `imageUrl_travailleur` varchar(255) DEFAULT NULL,
  `role` enum('SIMPLE','ADMINISTRATEUR') NOT NULL,
  `email_travailleur` varchar(255) NOT NULL,
  `password_travailleur` varchar(255) NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_code` int(11) DEFAULT NULL,
  `code_expires_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `vivant` tinyint(1) DEFAULT 1,
  `prenom_travailleur` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `travailleur`
--
-- Index pour les tables déchargées
--

--
-- Index pour la table `conjoint`
--
ALTER TABLE `conjoint`
  ADD PRIMARY KEY (`id_conjoint`),
  ADD UNIQUE KEY `cin_conjoint` (`cin_conjoint`),
  ADD KEY `fk_travailleur_conjoint` (`id_travailleur`);

--
-- Index pour la table `enfants`
--
ALTER TABLE `enfants`
  ADD PRIMARY KEY (`id_enfant`),
  ADD KEY `fk_travailleur_enfant` (`id_travailleur`);

--
-- Index pour la table `excel`
--
ALTER TABLE `excel`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `remplacant`
--
ALTER TABLE `remplacant`
  ADD PRIMARY KEY (`id_remplacant`),
  ADD KEY `fk_travailleur_remplacant` (`id_travailleur`),
  ADD KEY `fk_conjoint_remplacant` (`conjointId`),
  ADD KEY `fk_enfant_remplacant` (`enfantId`);

--
-- Index pour la table `travailleur`
--
ALTER TABLE `travailleur`
  ADD PRIMARY KEY (`id_travailleur`),
  ADD UNIQUE KEY `codeMenage` (`codeMenage`),
  ADD UNIQUE KEY `cin_travailleur` (`cin_travailleur`),
  ADD UNIQUE KEY `email_travailleur` (`email_travailleur`);


--
-- AUTO_INCREMENT pour la table `excel`
--
ALTER TABLE `excel`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `conjoint`
--
ALTER TABLE `conjoint`
  ADD CONSTRAINT `fk_travailleur_conjoint` FOREIGN KEY (`id_travailleur`) REFERENCES `travailleur` (`id_travailleur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `enfants`
--
ALTER TABLE `enfants`
  ADD CONSTRAINT `fk_travailleur_enfant` FOREIGN KEY (`id_travailleur`) REFERENCES `travailleur` (`id_travailleur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `remplacant`
--
ALTER TABLE `remplacant`
  ADD CONSTRAINT `fk_conjoint_remplacant` FOREIGN KEY (`conjointId`) REFERENCES `conjoint` (`id_conjoint`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enfant_remplacant` FOREIGN KEY (`enfantId`) REFERENCES `enfants` (`id_enfant`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_travailleur_remplacant` FOREIGN KEY (`id_travailleur`) REFERENCES `travailleur` (`id_travailleur`) ON DELETE CASCADE;
COMMIT;
