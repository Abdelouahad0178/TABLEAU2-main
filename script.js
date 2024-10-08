// Initialiser le canevas Fabric.js
const canvas = new fabric.Canvas('canvas', {
    isDrawingMode: false,
    backgroundColor: 'white',
    width: 1130,
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
const deleteObjectBtn = document.querySelector("#delete-object");
const showCalculatorBtn = document.querySelector("#show-calculator");
const calculatorCanvas = document.querySelector("#calculator-canvas");
const canvasCalcDisplay = document.querySelector("#canvas-calc-display");
const canvasCalcButtons = document.querySelectorAll("#calculator-canvas .calc-btn");
const closeCanvasCalculatorBtn = document.querySelector("#close-canvas-calculator");

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
    canvas.isDrawingMode = false;  // Désactiver le mode dessin après avoir ajouté une forme
}

// Activer le pinceau
document.getElementById('brush').addEventListener('click', () => {
    canvas.isDrawingMode = true; // Activer le mode dessin
    canvas.selection = false;    // Désactiver la sélection d'objets pendant le dessin
});

// Activer la gomme (simuler la gomme en dessinant avec la couleur du fond)
document.getElementById('eraser').addEventListener('click', () => {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = "white"; // Utiliser la couleur blanche comme gomme
});

// Désactiver le pinceau et activer la sélection d'objets après avoir dessiné
canvas.on('mouse:up', function() {
    canvas.isDrawingMode = false; // Désactiver le mode dessin une fois que la souris est relâchée
    canvas.selection = true;      // Réactiver la sélection des objets
});

// Ajouter gestionnaire d'événements pour chaque forme
document.getElementById('rectangle').addEventListener('click', () => addShape('rectangle'));
document.getElementById('circle').addEventListener('click', () => addShape('circle'));
document.getElementById('triangle').addEventListener('click', () => addShape('triangle'));

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

            canvas.add(img);
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
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

// Supprimer l'objet sélectionné
deleteObjectBtn.addEventListener("click", () => {
    const activeObject = canvas.getActiveObject(); // Récupérer l'objet sélectionné

    if (activeObject) {
        canvas.remove(activeObject); // Supprimer l'objet du canevas
        canvas.renderAll(); // Re-rendre le canevas après la suppression
    } else {
        alert("Aucun objet sélectionné !");
    }
});

// Afficher la calculatrice sur le canevas
showCalculatorBtn.addEventListener("click", () => {
    calculatorCanvas.style.display = 'block';
    calculatorCanvas.style.zIndex = 9999; // S'assurer que la calculatrice est au-dessus des autres éléments
});

// Fermer la calculatrice
closeCanvasCalculatorBtn.addEventListener("click", () => {
    calculatorCanvas.style.display = 'none'; // Fermer la calculatrice
});

// Gestion des boutons de la calculatrice
canvasCalcButtons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;

        if (value === "C") {
            canvasCalcDisplay.value = "";
        } else if (value === "=") {
            try {
                canvasCalcDisplay.value = eval(canvasCalcDisplay.value);
            } catch {
                canvasCalcDisplay.value = "Erreur";
            }
        } else {
            canvasCalcDisplay.value += value;
        }
    });
});
