import React from 'react'

const Exemple = () => {
  return (
     <div>
      <form onSubmit={handleSubmitEnfants}>
        {enfants.map((enfant, index) => (
          <div key={index} className="pd-20 card-box mb-30">
            <h4 className="text-blue h4">A propos de l'enfant {index + 1}</h4>

            <div className="form-group">
              <label>Nom de l'enfant</label>
              <input
                type="text"
                value={enfant.nom_enfant}
                onChange={(e) => handleEnfantChange(index, "nom_enfant", e.target.value)}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              />
            </div>

            {/* Ajoutez ici les autres champs pour chaque enfant */}
          </div>
        ))}

        <Button type="submit">Envoyer les informations des enfants</Button>
      </form>
    </div>
  )
}

export default Exemple
