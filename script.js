// Initialiser le canevas Fabric.js
const canvas = new fabric.Canvas('canvas', {
    isDrawingMode: false, 
    backgroundColor: 'white', 
    width: 1100,
    height: 900
});

// Paramètres du pinceau par défaut
canvas.freeDrawingBrush.color = "#000000"; // Couleur par défaut
canvas.freeDrawingBrush.width = 5; // Taille par défaut

// Sélection des éléments du DOM
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearCanvas = document.querySelector(".clear-canvas");
const saveImg = document.querySelector(".save-img");
const uploadImageInput = document.querySelector("#upload-image");
const addTextBtn = document.querySelector("#add-text-btn");
const textModal = document.querySelector("#text-modal");
const addTextToCanvasBtn = document.querySelector("#add-text-to-canvas");
const textContentInput = document.querySelector("#text-content");
const fontSizeInput = document.querySelector("#font-size");
const fontFamilySelect = document.querySelector("#font-family");
const fontWeightSelect = document.querySelector("#font-weight");
const textColorInput = document.querySelector("#text-color");
const fillColorCheckbox = document.querySelector("#fill-color");

// Fonction pour dessiner des formes
function addShape(type) {
    let shape;
    const fillColor = fillColorCheckbox && fillColorCheckbox.checked ? canvas.freeDrawingBrush.color : 'transparent';

    if (type === 'rectangle') {
        shape = new fabric.Rect({
            width: 100,
            height: 100,
            left: 150,
            top: 100,
            fill: fillColor,
            stroke: canvas.freeDrawingBrush.color,
            strokeWidth: 2
        });
    } else if (type === 'circle') {
        shape = new fabric.Circle({
            radius: 50,
            left: 150,
            top: 100,
            fill: fillColor,
            stroke: canvas.freeDrawingBrush.color,
            strokeWidth: 2
        });
    } else if (type === 'triangle') {
        shape = new fabric.Triangle({
            width: 100,
            height: 100,
            left: 150,
            top: 100,
            fill: fillColor,
            stroke: canvas.freeDrawingBrush.color,
            strokeWidth: 2
        });
    }

    shape.set({ selectable: true }); // Rendre la forme déplaçable et redimensionnable
    canvas.add(shape);
    canvas.renderAll();
}

// Activer le pinceau
document.getElementById('brush').addEventListener('click', () => {
    canvas.isDrawingMode = true;
    canvas.selection = false; // Désactiver la sélection d'objets
});

// Activer la gomme (simuler la gomme en dessinant avec la couleur du fond)
document.getElementById('eraser').addEventListener('click', () => {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = "white"; // Utiliser la couleur blanche comme gomme
});

// Ajuster la taille du pinceau/gomme
sizeSlider.addEventListener('change', () => {
    canvas.freeDrawingBrush.width = parseInt(sizeSlider.value);
});

// Gestion des couleurs pour le pinceau
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector(".colors .selected").classList.remove("selected");
        btn.classList.add("selected");
        const selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
        canvas.freeDrawingBrush.color = selectedColor;
    });
});

// Sélecteur de couleur personnalisé
colorPicker.addEventListener("change", () => {
    canvas.freeDrawingBrush.color = colorPicker.value;
});

// Effacer le canevas
clearCanvas.addEventListener("click", () => {
    canvas.clear(); // Effacer tout le canevas
    canvas.backgroundColor = 'white'; // Réinitialiser l'arrière-plan en blanc
    canvas.renderAll();
});

// Sauvegarder le dessin en tant qu'image
saveImg.addEventListener("click", () => {
    const dataURL = canvas.toDataURL({
        format: 'png',
        multiplier: 2
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `canvas_${Date.now()}.png`;
    link.click();
});

// Importer une image sur le canevas
uploadImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            img.set({
                left: 150,
                top: 100,
                scaleX: 0.5,
                scaleY: 0.5,
                selectable: true,
                hasBorders: true,
                hasControls: true
            });

            // Rendre l'image déplaçable et redimensionnable
            img.setControlsVisibility({
                mt: true, // top middle
                mb: true, // bottom middle
                ml: true, // middle left
                mr: true, // middle right
                bl: true, // bottom left
                br: true, // bottom right
                tl: true, // top left
                tr: true, // top right
            });

            canvas.add(img);
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
});

// Gestion des boutons pour ajouter des formes
document.getElementById('rectangle').addEventListener('click', () => {
    canvas.isDrawingMode = false;
    addShape('rectangle');
});
document.getElementById('circle').addEventListener('click', () => {
    canvas.isDrawingMode = false;
    addShape('circle');
});
document.getElementById('triangle').addEventListener('click', () => {
    canvas.isDrawingMode = false;
    addShape('triangle');
});

// Ajouter une zone de texte avec propriétés personnalisées
addTextBtn.addEventListener('click', () => {
    textModal.style.display = 'block'; // Afficher la modale pour ajouter du texte
});

// Ajouter le texte au canevas
addTextToCanvasBtn.addEventListener('click', () => {
    const textContent = textContentInput.value;
    const fontSize = fontSizeInput.value;
    const fontFamily = fontFamilySelect.value;
    const fontWeight = fontWeightSelect.value;
    const textColor = textColorInput.value;

    const newText = new fabric.Text(textContent, {
        left: 150,
        top: 100,
        fontSize: parseInt(fontSize),
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fill: textColor,
        selectable: true, // Rendre le texte déplaçable et redimensionnable
    });

    canvas.add(newText);
    canvas.renderAll();
    textModal.style.display = 'none'; // Fermer la modale après ajout
});

// Sélection du bouton "Supprimer l'objet sélectionné"
const deleteObjectBtn = document.querySelector("#delete-object");

// Ajouter l'événement click pour supprimer l'objet sélectionné
deleteObjectBtn.addEventListener("click", () => {
    const activeObject = canvas.getActiveObject(); // Récupérer l'objet sélectionné

    if (activeObject) {
        canvas.remove(activeObject); // Supprimer l'objet du canevas
        canvas.renderAll(); // Re-rendre le canevas après la suppression
    } else {
        alert("Aucun objet sélectionné !");
    }
});
