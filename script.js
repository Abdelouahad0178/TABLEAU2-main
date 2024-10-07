const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    addTextBtn = document.querySelector("#add-text"),
    textInput = document.querySelector("#text-input"),
    fontSizeInput = document.querySelector("#font-size"),
    fontFamilySelect = document.querySelector("#font-family"),
    fontWeightSelect = document.querySelector("#font-weight"),
    textColorInput = document.querySelector("#text-color"),
    uploadImageInput = document.querySelector("#upload-image"),
    calcDisplay = document.querySelector("#calc-display"),
    calcButtons = document.querySelectorAll(".calc-btn"),
    calculator = document.querySelector(".calculator"), // Calculatrice container
    calcBtn = document.querySelector("#calc-btn"), // Bouton pour afficher la calculatrice
    ctx = canvas.getContext("2d", { willReadFrequently: true });

// Variables pour la calculatrice
let calcExpression = "";

// Variables globales pour stocker les objets et gérer les événements
let isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000",
    isMovingElement = false,
    movingElementIndex = -1,
    objects = [], // Liste des objets (images, textes, formes)
    snapshot,
    prevMouseX, prevMouseY,
    currentShape = null, // Pour stocker temporairement la forme dessinée
    isResizingImage = false,
    resizingCorner = null;

// Fonction pour définir l'arrière-plan du canevas en blanc
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // Réinitialise la couleur sélectionnée
};

// Fonction pour obtenir la position du curseur ou du toucher
const getPointerPosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    return { x, y };
};

// Fonction pour dessiner un rectangle
const drawRect = (object) => {
    ctx.beginPath();
    ctx.strokeStyle = object.color;
    ctx.lineWidth = object.lineWidth;
    if (object.fill) {
        ctx.fillStyle = object.color;
        ctx.fillRect(object.x, object.y, object.width, object.height);
    } else {
        ctx.strokeRect(object.x, object.y, object.width, object.height);
    }
};

// Fonction pour dessiner un cercle
const drawCircle = (object) => {
    ctx.beginPath();
    ctx.strokeStyle = object.color;
    ctx.lineWidth = object.lineWidth;
    ctx.arc(object.x, object.y, object.radius, 0, 2 * Math.PI);
    if (object.fill) {
        ctx.fillStyle = object.color;
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

// Fonction pour dessiner un triangle
const drawTriangle = (object) => {
    ctx.beginPath();
    ctx.moveTo(object.x1, object.y1);
    ctx.lineTo(object.x2, object.y2);
    ctx.lineTo(object.x3, object.y3);
    ctx.closePath();
    ctx.strokeStyle = object.color;
    ctx.lineWidth = object.lineWidth;
    if (object.fill) {
        ctx.fillStyle = object.color;
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

// Fonction pour dessiner un texte
const drawText = (object) => {
    ctx.font = `${object.fontWeight} ${object.fontSize}px ${object.fontFamily}`;
    ctx.fillStyle = object.color;
    ctx.fillText(object.text, object.x, object.y);
};

// Fonction pour dessiner une image
const drawImage = (object) => {
    if (object.image) {
        ctx.drawImage(object.image, object.x, object.y, object.width, object.height);
        // Dessiner les poignées de redimensionnement
        if (object === objects[movingElementIndex]) {
            drawImageHandles(object);
        }
    }
};

// Fonction pour dessiner les poignées de redimensionnement sur l'image sélectionnée
const drawImageHandles = (object) => {
    const handleSize = 10;
    const corners = [
        { x: object.x, y: object.y }, // Haut-gauche
        { x: object.x + object.width, y: object.y }, // Haut-droit
        { x: object.x, y: object.y + object.height }, // Bas-gauche
        { x: object.x + object.width, y: object.y + object.height }, // Bas-droit
    ];

    ctx.fillStyle = '#000';
    corners.forEach(corner => {
        ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });
};

// Fonction pour vérifier si le pointeur est sur une poignée de redimensionnement
const isOnHandle = (x, y, object) => {
    const handleSize = 10;
    const corners = [
        { x: object.x, y: object.y, position: 'top-left' },
        { x: object.x + object.width, y: object.y, position: 'top-right' },
        { x: object.x, y: object.y + object.height, position: 'bottom-left' },
        { x: object.x + object.width, y: object.y + object.height, position: 'bottom-right' },
    ];

    for (let corner of corners) {
        if (
            x >= corner.x - handleSize / 2 &&
            x <= corner.x + handleSize / 2 &&
            y >= corner.y - handleSize / 2 &&
            y <= corner.y + handleSize / 2
        ) {
            return corner.position;
        }
    }
    return null;
};

// Fonction pour redessiner tous les objets sur le canevas
const redrawCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer le canevas
    setCanvasBackground(); // Réinitialiser le fond blanc

    objects.forEach(object => {
        switch (object.type) {
            case 'rectangle':
                drawRect(object);
                break;
            case 'circle':
                drawCircle(object);
                break;
            case 'triangle':
                drawTriangle(object);
                break;
            case 'text':
                drawText(object);
                break;
            case 'image':
                drawImage(object);
                break;
        }
    });
};

// Fonction pour démarrer le dessin ou le déplacement d'un élément
const startDrawOrMove = (e) => {
    const { x, y } = getPointerPosition(e);

    // Vérifier si l'utilisateur clique sur une poignée de redimensionnement
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'image') {
            const handle = isOnHandle(x, y, obj);
            if (handle) {
                isResizingImage = true;
                resizingCorner = handle;
                movingElementIndex = i;
                prevMouseX = x;
                prevMouseY = y;
                return;
            }
        }
    }

    // Vérifier si l'utilisateur clique sur un objet pour le déplacer
    movingElementIndex = objects.findIndex((obj, index) => {
        if (obj.type === 'image') {
            return x > obj.x && x < obj.x + obj.width && y > obj.y && y < obj.y + obj.height;
        } else if (obj.type === 'text') {
            const textWidth = ctx.measureText(obj.text).width;
            const textHeight = parseInt(obj.fontSize);
            return x > obj.x && x < obj.x + textWidth && y > obj.y - textHeight && y < obj.y;
        } else if (obj.type === 'rectangle') {
            return x > obj.x && x < obj.x + obj.width && y > obj.y && y < obj.y + obj.height;
        } else if (obj.type === 'circle') {
            let distance = Math.sqrt(Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2));
            return distance <= obj.radius;
        } else if (obj.type === 'triangle') {
            let minX = Math.min(obj.x1, obj.x2, obj.x3);
            let maxX = Math.max(obj.x1, obj.x2, obj.x3);
            let minY = Math.min(obj.y1, obj.y2, obj.y3);
            let maxY = Math.max(obj.y1, obj.y2, obj.y3);
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }
        return false;
    });

    if (movingElementIndex !== -1) {
        isMovingElement = true;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        prevMouseX = x;
        prevMouseY = y;
        e.preventDefault();
        return;
    }

    // Si aucun élément n'est sélectionné pour le déplacement, on commence à dessiner une nouvelle forme
    isDrawing = true;
    prevMouseX = x;
    prevMouseY = y;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Initialiser la forme en cours
    currentShape = {
        type: selectedTool,
        color: selectedColor,
        fill: fillColor.checked,
        lineWidth: brushWidth
    };
};

// Fonction pour dessiner la forme en fonction de l'outil sélectionné
const drawShape = (x, y) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0); // Restaurer l'état précédent avant de dessiner la forme

    switch (selectedTool) {
        case 'rectangle':
            currentShape.x = Math.min(prevMouseX, x);
            currentShape.y = Math.min(prevMouseY, y);
            currentShape.width = Math.abs(x - prevMouseX);
            currentShape.height = Math.abs(y - prevMouseY);
            drawRect(currentShape);
            break;
        case 'circle':
            currentShape.x = prevMouseX;
            currentShape.y = prevMouseY;
            currentShape.radius = Math.sqrt(Math.pow((x - prevMouseX), 2) + Math.pow((y - prevMouseY), 2));
            drawCircle(currentShape);
            break;
        case 'triangle':
            currentShape.x1 = prevMouseX;
            currentShape.y1 = prevMouseY;
            currentShape.x2 = x;
            currentShape.y2 = y;
            currentShape.x3 = 2 * prevMouseX - x;
            currentShape.y3 = y;
            drawTriangle(currentShape);
            break;
    }
};

// Fonction pour déplacer l'objet sélectionné ou redimensionner une image
const moveElement = (e) => {
    const { x, y } = getPointerPosition(e);

    if (isResizingImage && movingElementIndex !== -1) {
        const obj = objects[movingElementIndex];
        const dx = x - prevMouseX;
        const dy = y - prevMouseY;

        switch (resizingCorner) {
            case 'top-left':
                obj.x += dx;
                obj.y += dy;
                obj.width -= dx;
                obj.height -= dy;
                break;
            case 'top-right':
                obj.y += dy;
                obj.width += dx;
                obj.height -= dy;
                break;
            case 'bottom-left':
                obj.x += dx;
                obj.width -= dx;
                obj.height += dy;
                break;
            case 'bottom-right':
                obj.width += dx;
                obj.height += dy;
                break;
        }
        redrawCanvas();
        prevMouseX = x;
        prevMouseY = y;
    } else if (isMovingElement && movingElementIndex !== -1) {
        const dx = x - prevMouseX;
        const dy = y - prevMouseY;
        const obj = objects[movingElementIndex];

        // Mettre à jour les coordonnées de l'objet
        if (obj.type === 'image' || obj.type === 'rectangle' || obj.type === 'circle') {
            obj.x += dx;
            obj.y += dy;
        } else if (obj.type === 'text') {
            obj.x += dx;
            obj.y += dy;
        } else if (obj.type === 'triangle') {
            obj.x1 += dx;
            obj.y1 += dy;
            obj.x2 += dx;
            obj.y2 += dy;
            obj.x3 += dx;
            obj.y3 += dy;
        }

        redrawCanvas();
        prevMouseX = x;
        prevMouseY = y;
    } else if (isDrawing) {
        drawShape(x, y);
    }
};

// Fonction pour arrêter le dessin ou le déplacement
const stopDrawOrMove = () => {
    if (isDrawing) {
        // Ajouter la forme au tableau des objets
        objects.push(currentShape);
    }
    isDrawing = false;
    isMovingElement = false;
    isResizingImage = false;
    movingElementIndex = -1;
    resizingCorner = null;
};

// Gestion des événements pour sélectionner un outil
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id; // Définir l'outil sélectionné
    });
});

// Gestion de la taille du pinceau
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

// Gestion des couleurs
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

// Gestion du sélecteur de couleur personnalisé
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

// Fonction pour ajouter du texte sur le canevas
addTextBtn.addEventListener("click", () => {
    const newText = {
        type: 'text',
        text: textInput.value,
        x: 50,
        y: 50,
        fontSize: fontSizeInput.value,
        fontFamily: fontFamilySelect.value,
        fontWeight: fontWeightSelect.value,
        color: textColorInput.value
    };
    objects.push(newText);
    redrawCanvas(); // Redessiner le canevas avec le nouveau texte
});

// Fonction pour gérer l'importation d'une image
uploadImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            const newImage = {
                type: 'image',
                image: img,
                x: 50,
                y: 50,
                width: img.width / 2,
                height: img.height / 2
            };
            objects.push(newImage);
            redrawCanvas(); // Redessiner le canevas avec la nouvelle image
        };
    };
    reader.readAsDataURL(file);
});

// Effacer le canevas
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects = []; // Réinitialiser tous les objets
    setCanvasBackground();
});

// Sauvegarder le dessin en tant qu'image
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

// Gestion des événements pour dessiner ou déplacer les objets

// Pour les écrans tactiles
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDrawOrMove(e);
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    moveElement(e);
});

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopDrawOrMove();
});

// Pour les écrans non tactiles
canvas.addEventListener("mousedown", startDrawOrMove);
canvas.addEventListener("mousemove", moveElement);
canvas.addEventListener("mouseup", stopDrawOrMove);

// Initialisation de l'arrière-plan du canevas lors du chargement de la page
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

// Fonction pour afficher/masquer la calculatrice
calcBtn.addEventListener('click', () => {
    if (calculator.style.display === "none" || calculator.style.display === "") {
        calculator.style.display = "block";
    } else {
        calculator.style.display = "none";
    }
});

// Fonctionnalité de la calculatrice
calcButtons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.getAttribute('data-value');
        if (value === "=") {
            try {
                calcExpression = eval(calcExpression);
                calcDisplay.value = calcExpression;
            } catch {
                calcDisplay.value = "Erreur";
            }
        } else if (value === "C") {
            calcExpression = "";
            calcDisplay.value = calcExpression;
        } else {
            calcExpression += value;
            calcDisplay.value = calcExpression;
        }
    });
});
