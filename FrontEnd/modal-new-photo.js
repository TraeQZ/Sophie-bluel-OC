//CONSTANTES
const NEW_MODALE = document.querySelector(".modal-new-photo");
const BUTTON_CLOSE_NEW = document.querySelector(".js-modal-close-new");
const BUTTON_BACK = document.querySelector(".modal-back");
const BUTTON_ADD_PHOTO = document.querySelector(".button-add-photo");
const INPUT_PICTURE = document.querySelector("#input-picture");
const PICTURE_PREVIEW = document.querySelector("#picture-preview");
const PICTURE_SELECTION = document.querySelector(".picture-selection");
const CATEGORIES_SELECT = document.querySelector(".select-category");
const TITLE_NEW_PHOTO = document.querySelector(".input-titre");
const BUTTON_SUBMIT = document.querySelector(".button-submit");
const BUTTON_ADD_WORK = document.querySelector("#ajout_projet");

let modal_new = null;

//fonctions

//FONCTION OUVERTURE BOITE MODALE
const OPEN_MODAL_NEW = function (e) {
  e.preventDefault();
  //ON CACHE LA MODAL-GALLERY
  modal.style.display = "none";
  //ON AFFICHE LA MODALE DE CREATION
  modal_new = document.querySelector("#modal2");
  modal_new.style.display = null;
  modal_new.addEventListener("click", CLOSE_MODAL_NEW);

  let modal_wrapper = document.querySelector(".modal-wrapper-new");
  modal_wrapper.style.display = "flex";

  resetPhotoSelection(); //REMISE A VIDE DE LA SELECTION PHOTO
  resetForm(); // REMISE A VIDE FORMULAIRE AJOUT PHOTO
  loadCategories();
};

//FONCTION FERMETURE BOITE MODALE
const CLOSE_MODAL_NEW = function (e) {
  if (modal_new == null) return;

  //SI ON CLIQUE SUR AUTRE CHOSE QUE LA MODALE OU LE BOUTON ON NE VEUT PAS FERMER

  if (
    e.target != modal_new &&
    e.target != BUTTON_CLOSE_NEW &&
    e.target != document.querySelector(".top2 .fa-x")
  )
    return;

  e.preventDefault;
  modal_new.style.display = "none";
};

//CHARGEMENT CATEGORIES DEPUIS API
/**
 * recupere les categor depuis api et les afficher en ajoutant categorie select
 */
function loadCategories() {
  CATEGORIES_SELECT.innerHTML = ""; //ON VIDE AVANT DE FETCH POUR NE PAS ACCUMULER LES CATEGORIES

  let option = document.createElement("option");
  option.value = 0;
  option.text = "";
  CATEGORIES_SELECT.add(option); // AJOUT CATEGORIE VIDE ( 1er ligne) DANS LE FORMULAIRE

  //Récupère les catégories depuis l'API et les ajoute à un menu déroulant (select).
  // 1. Lance une requête HTTP pour récupérer les données de l'API des catégories.

  fetch(CATEGORY_API)
    .then((reponse) => reponse.json()) // 2. Convertit la réponse en un objet JSON.
    .then((categories) => {
      for (let category of categories) {
        // Crée un nouvel élément <option> pour le menu déroulant.
        let option = document.createElement("option"); // Assigne la valeur (l'ID de la catégorie) et le texte (le nom de la catégorie) à l'option.
        option.value = category.id;
        option.text = category.name;
        CATEGORIES_SELECT.add(option);
      }
    });
}

//REMISE A ZERO SELECTION IMAGE
function resetPhotoSelection() {
  INPUT_PICTURE.value = "";
  PICTURE_PREVIEW.src = "";
  PICTURE_PREVIEW.style.display = "none";
  PICTURE_SELECTION.style.display = "block";
}

//REMISE A ZERO la categorie et titre
function resetForm() {
  CATEGORIES_SELECT.value = 0;
  TITLE_NEW_PHOTO.value = "";
}

//UPLOAD NOUVEAU PROJET:
const ADD_WORK_TO_API = function () {
  let token = sessionStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", INPUT_PICTURE.files[0]);
  formData.append("title", TITLE_NEW_PHOTO.value);
  formData.append("category", CATEGORIES_SELECT.value);

  fetch(WORKS_API, {
    // appel les travaux via l'api
    method: "POST",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then((response) => {
    if (response.status === 200 || response.status === 201) {
      //REAFFICHAGE TRAVAUX DANS MODALE
      fetchWorks(true);
      //REAFFICHAGE TRAVAUX DANS INDEX
      fetchWorks(false);

      resetPhotoSelection(); //REMISE A ZERO APERCU PHOTO
      resetForm(); //REMISE A ZERO FORMULAIRE
      VERIFICATION();
    } else if (response.status === 401) {
      alert("Session expirée ou invalide");
    } else {
      alert("Erreur technique inconnue");
    }
  });
};

//VERIFICATION FORMULAIRE COMPLET: bouton valider
const VERIFICATION = function (e) {
  if (
    INPUT_PICTURE.value != "" &&
    CATEGORIES_SELECT.value != 0 &&
    TITLE_NEW_PHOTO.value != ""
  ) {
    BUTTON_SUBMIT.style.backgroundColor = "#1D6154";
    BUTTON_SUBMIT.style.cursor = "pointer";
    BUTTON_SUBMIT.addEventListener("click", ADD_WORK_TO_API);
  } else {
    BUTTON_SUBMIT.style.backgroundColor = "#A7A7A7";
    BUTTON_SUBMIT.style.cursor = "default";
    BUTTON_SUBMIT.removeEventListener("click", ADD_WORK_TO_API);
  }
};

// register listners:

/**
 * si je clique sur bouton add work on appl fonction open modal new
 */
BUTTON_ADD_WORK.addEventListener("click", OPEN_MODAL_NEW);

BUTTON_CLOSE_NEW.addEventListener("click", CLOSE_MODAL_NEW);
//BOUTON RETOUR: en cliqunat sur button back, la fonction se declenche masque l element anec id : nex modal et affiche l'element avec id modal
BUTTON_BACK.addEventListener("click", function () {
  modal_new.style.display = "none";
  modal.style.display = "flex";
});

//Ajouter une photo

BUTTON_ADD_PHOTO.addEventListener("click", function () {
  INPUT_PICTURE.click();
});

// SELECTEUR FICHIER PHOTO:Cet événement se déclenche lorsqu'un fichier a été sélectionné
INPUT_PICTURE.addEventListener("change", function () {
  if (this.files[0].size > 4194304) {
    // 4194304 octets = 4 Mo
    alert("Fichier trop volumineux");
    this.value = "";
  }
  if (this.files[0]) {
    PICTURE_PREVIEW.style.display = "block";
    PICTURE_SELECTION.style.display = "none";
  }
});

//ajouter des change listner sur tt les input pr verifier et changer l'etat de bouton valider

INPUT_PICTURE.addEventListener("change", VERIFICATION);
CATEGORIES_SELECT.addEventListener("change", VERIFICATION);
TITLE_NEW_PHOTO.addEventListener("change", VERIFICATION);

// SELECTEUR FICHIER PHOTO: Cet événement se déclenche lorsqu'un fichier a été sélectionné
INPUT_PICTURE.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    // Vérification de la taille du fichier (4 Mo)
    if (file.size > 4194304) {
      alert("Fichier trop volumineux");
      this.value = ""; // Réinitialise l'input
      resetPhotoSelection(); // Réinitialise l'affichage
      VERIFICATION(); // Vérifie l'état du bouton
      return; // Arrête l'exécution de la fonction
    }
    // Affiche la prévisualisation de l'image
    const reader = new FileReader(); // Crée un nouvel objet 'FileReader' pour lire le contenu d'un fichier.
    // Définit la fonction à exécuter lorsque le fichier est lu avec succès.
    // L'événement 'onload' se déclenche une fois la lecture terminée.

    reader.onload = function (e) {
      PICTURE_PREVIEW.src = e.target.result;
      PICTURE_PREVIEW.style.display = "block";
      PICTURE_SELECTION.style.display = "none";
    };
    reader.readAsDataURL(file);
  } else {
    // Si l'utilisateur annule la sélection
    resetPhotoSelection();
  }

  VERIFICATION(); // Appelle la fonction de vérification
});
