// Initialiser EmailJS
emailjs.init("c0ulvhs7CEBjajqEw");

let currentAccessCode = "";
let codeExpirationTimeout = null;

const projetsContainer = document.getElementById("projetsContainer");
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModal");
const cancelBtn = document.getElementById("cancel");
const form = document.getElementById("projectForm");
const sendCodeBtn = document.getElementById("sendCode");
const submitBtn = document.getElementById("submitBtn");

const firstVisitPopup = document.getElementById("firstVisitPopup");
const popupStep1 = document.getElementById("popupStep1");
const popupStep2 = document.getElementById("popupStep2");
const btnYes = document.getElementById("btnYes");
const btnNo = document.getElementById("btnNo");
const btnClosePopup = document.getElementById("btnClosePopup");

// Pop-up de première visite
window.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("firstVisitDone")) {
    firstVisitPopup.classList.remove("hidden");
    popupStep1.classList.remove("hidden");
    popupStep2.classList.add("hidden");
  } else {
    firstVisitPopup.classList.add("hidden");
  }

  btnNo.addEventListener("click", () => {
    firstVisitPopup.classList.add("hidden");
    localStorage.setItem("firstVisitDone", "1");
  });

  btnYes.addEventListener("click", () => {
    popupStep1.classList.add("hidden");
    popupStep2.classList.remove("hidden");
  });

  btnClosePopup.addEventListener("click", () => {
    firstVisitPopup.classList.add("hidden");
    localStorage.setItem("firstVisitDone", "1");
  });

  chargerProjets();
});

// Ouverture / Fermeture modals
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  form.reset();
});

// Génération et envoi du code unique
function genererCodeUnique() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function envoyerCodeParEmail() {
  currentAccessCode = genererCodeUnique();
  const now = new Date().toLocaleString();

  if (codeExpirationTimeout) clearTimeout(codeExpirationTimeout);
  codeExpirationTimeout = setTimeout(() => {
    currentAccessCode = "";
    alert("Le code a expiré (30 minutes).");
  }, 30 * 60 * 1000); // 30 minutes

  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = "Code envoyé !";
  document.getElementById("sendDeleteCode").disabled = true;
  document.getElementById("sendDeleteCode").textContent = "Code envoyé !";

  emailjs.send("service_29coykj", "template_c5ztfnj", {
    code: currentAccessCode,
    date: now
  }).then(() => {
    alert("Le code a été envoyé au créateur ! Il est valide pendant 30 minutes.");
  }).catch(() => {
    alert("Erreur lors de l’envoi du code.");
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = "📧 Envoyer un code au créateur";
    document.getElementById("sendDeleteCode").disabled = false;
    document.getElementById("sendDeleteCode").textContent = "📧 Envoyer un code au créateur";
  });
}

sendCodeBtn.addEventListener("click", envoyerCodeParEmail);
document.getElementById("sendDeleteCode").addEventListener("click", envoyerCodeParEmail);

// Soumission formulaire ajout
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const code = document.getElementById("codeInput").value.trim();
  if (code !== currentAccessCode) {
    alert("Code incorrect ou expiré.");
    return;
  }

  const nouveau = {
    titre: document.getElementById("titre").value,
    description: document.getElementById("description").value,
    lienSite: document.getElementById("lienSite").value,
    lienGithub: document.getElementById("lienGithub").value,
    image: document.getElementById("image").value,
    date: document.getElementById("date").value
  };

  try {
    const res = await fetch("/api/projets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nouveau)
    });

    if (res.ok) {
      await chargerProjets();
      modal.classList.add("hidden");
      form.reset();
    } else {
      alert("Erreur lors de l'ajout du projet.");
    }
  } catch (err) {
    alert("Erreur de connexion au serveur.");
  }
});

// Remplir la liste des projets dans la modale suppression
async function chargerTitresProjets() {
  const res = await fetch('/projets');
  const projets = await res.json();
  const select = document.getElementById('projectSelect');
  select.innerHTML = '<option value="" disabled selected>Sélectionne un projet</option>';
  projets.forEach(p => {
    const option = document.createElement('option');
    option.value = p.titre;
    option.textContent = p.titre;
    select.appendChild(option);
  });
}

document.getElementById('openDeleteModal').addEventListener('click', () => {
  chargerTitresProjets();
  document.getElementById('deleteModal').classList.remove('hidden');
});
document.getElementById('cancelDelete').addEventListener('click', () => {
  document.getElementById('deleteModal').classList.add('hidden');
});

// Soumission suppression
document.getElementById('deleteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titre = document.getElementById('projectSelect').value;
  const code = document.getElementById('deleteCodeInput').value.trim();

  if (code !== currentAccessCode) {
    alert("Code incorrect ou expiré.");
    return;
  }

  const res = await fetch('/supprimer-projet', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titre })
  });

  if (res.ok) {
    alert('Projet supprimé avec succès');
    document.getElementById('deleteModal').classList.add('hidden');
    location.reload();
  } else {
    alert('Erreur lors de la suppression.');
  }
});

// Chargement des projets pour affichage
async function chargerProjets() {
  projetsContainer.innerHTML = "";
  try {
    const res = await fetch("/api/projets");
    const projets = await res.json();
    afficherProjets(projets);
  } catch (err) {
    projetsContainer.innerHTML = "<p>Erreur de chargement des projets.</p>";
  }
}

function afficherProjets(projets) {
  projetsContainer.innerHTML = "";
  projets.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    if (p.image) {
      const img = document.createElement("img");
      img.src = p.image;
      card.appendChild(img);
    }

    const title = document.createElement("h3");
    title.textContent = p.titre;
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = p.description;
    card.appendChild(desc);

    const links = document.createElement("div");
    links.className = "links";

    if (p.lienSite) {
      const a1 = document.createElement("a");
      a1.href = p.lienSite;
      a1.textContent = "🌐 Site";
      a1.target = "_blank";
      links.appendChild(a1);
    }

    if (p.lienGithub) {
      const a2 = document.createElement("a");
      a2.href = p.lienGithub;
      a2.textContent = "💻 GitHub";
      a2.target = "_blank";
      links.appendChild(a2);
    }

    card.appendChild(links);

    if (p.date) {
      const d = document.createElement("div");
      d.className = "date";
      d.textContent = `Créé le : ${p.date}`;
      card.appendChild(d);
    }

    projetsContainer.appendChild(card);
  });
}
