const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const projetsFile = path.join(__dirname, "projets.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GET tous les projets
app.get("/api/projets", (req, res) => {
  fs.readFile(projetsFile, "utf8", (err, data) => {
    if (err) return res.status(500).send("Erreur de lecture du fichier");
    res.json(JSON.parse(data));
  });
});

// POST un nouveau projet
app.post("/api/projets", (req, res) => {
  const nouveauProjet = req.body;
  fs.readFile(projetsFile, "utf8", (err, data) => {
    if (err) return res.status(500).send("Erreur de lecture");

    const projets = JSON.parse(data);
    projets.unshift(nouveauProjet); // Ajouter en haut
    fs.writeFile(projetsFile, JSON.stringify(projets, null, 2), (err) => {
      if (err) return res.status(500).send("Erreur d’écriture");
      res.status(201).send("Projet ajouté");
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

app.delete('/supprimer-projet', (req, res) => {
  const { titre } = req.body;

  fs.readFile('projets.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erreur serveur');
    let projets = JSON.parse(data);
    const avant = projets.length;
    projets = projets.filter(p => p.titre !== titre);

    if (projets.length === avant) {
      return res.status(404).send('Projet non trouvé');
    }

    fs.writeFile('projets.json', JSON.stringify(projets, null, 2), (err) => {
      if (err) return res.status(500).send('Erreur lors de la suppression');
      res.send('Projet supprimé');
    });
  });
});
