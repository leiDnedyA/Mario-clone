
const canvas = document.querySelector('#editorCanvas');
const ctx = canvas.getContext('2d');

const zoomRestrictions = {
    maximum: 300,
    minimum: 20,
}

const cameraRestrictions = {
    x: {
        minimum: -20,
        maximum: 100,
    },
    y: {
        minimum: -20,
        maximum: 100
    },
}

const mouseData = {
    isDown: false,
    target: null,
    lastDownPos: [0, 0],
}

var zoomScale = 50;
var cameraOffset = [0, 0]

const getZoomVelocity = _ => (zoomScale / 5);

var tileSize = window.innerHeight / zoomScale;

var loadedPlatforms = [];
var loadedEntities = [];
var loadedDoors = [];
var loadedBoundsObjs = {};

const gameObjects = {
    platform: loadedPlatforms,
    entity: loadedEntities,
    door: loadedDoors
}

const getGameObject = (type, index) => {
    switch (type) {
        case 'platform':
            return loadedPlatforms[index];
        case 'entity':
            return loadedEntities[index];
        case 'door':
            return loadedDoors[index];
        case 'boundsObj':
            if (loadedBoundsObjs.hasOwnProperty(index)) {
                return loadedBoundsObjs[index];
            }
            return null;
        default:
            return null;
    }
}

const deleteGameObject = (type, index) => { //REMINDER: this will only delete objects from the current view

    switch (type) {
        case 'platform':
            return loadedPlatforms.splice(index, 1);
        case 'entity':
            return loadedEntities.splice(index, 1);
        case 'door':
            return loadedDoors.splice(index, 1);
        default:
            return null;
    }
}

/**
 * selectedObjectData and mouseoverObjectData contain info about which game objects
 * are currently selected/moused over.
 * 
 * valid values of 'type' include 'platform', 'entity', 'door', and 'boundsObj'.
 * 'index' refers to the index of the gameObject in its respective list e.g loadedPlatforms, loadedEntities, loadedDoors.
 * 
 */
var selectedObjectData = {
    type: '',
    index: 0,
    isSelected: false,
    position: [0, 0],
    clickPosition: [0, 0],
    gui: new dat.GUI({ name: 'Gameobject Properties' }),
    guiElements: {},
    reset: function () {
        this.type = '';
        this.index = 0;
        this.isSelected = false;
        this.position = [0, 0];
        this.guiReset();
    },
    guiReset: function () {
        if (this.gui) {
            for (let i in this.guiElements) {
                if (this.guiElements[i] instanceof dat.controllers.Controller) {
                    this.gui.remove(this.guiElements[i]);
                } else {
                    this.gui.removeFolder(this.guiElements[i])
                }
                delete this.guiElements[i];
            }
        }
    },
    getSelectedObj: function () {
        return getGameObject(this.type, this.index);
    },
    getClickPosition: function () { return [this.clickPosition[0] * 1, this.clickPosition[1] * 1] },
    setClickPos: function (clickPos) {
        this.clickPosition = clickPos;
    },
    loadObject: function (type, index, clickPosition) {
        this.guiReset();
        this.type = type;
        this.index = index;
        this.clickPosition = clickPosition;
        let pos = this.getSelectedObj().position;
        this.position = [pos[0], pos[1]];

        let obj = this.getSelectedObj();

        let ctrlObj = {
            xPos: obj.position[0],
            yPos: obj.position[1],
            width: obj.dimensions[0],
            height: obj.dimensions[1],
        }


        this.guiElements['position'] = this.gui.addFolder('Position');
        this.guiElements['position'].open();
        this.guiElements['position'].add(obj.position, 0, -100, 100);
        this.guiElements['position'].add(obj.position, 1, -100, 100);

        this.guiElements['dimensions'] = this.gui.addFolder('Dimensions');
        this.guiElements['dimensions'].open();
        this.guiElements['dimensions'].add(obj.dimensions, 0, 1, 300, 1).onChange(obj.update);
        this.guiElements['dimensions'].add(obj.dimensions, 1, 1, 300, 1).onChange(obj.update);

    }
}

var mouseoverObjectData = {
    type: '',
    index: 0
}

//handles moving/resizing gameObjects via drag and drop
var objectEditor = {
    enabled: false,
    resizeEnabled: false,
    disableCamera: false,
    isDragging: false,
    handleMouseDown: _ => { },
    handleMouseMove: _ => { },
    handleMouseUp: _ => { },
}

const screenPosToWorldPos = pos => ([(pos[0] / tileSize) - cameraOffset[0], (pos[1] / tileSize) - cameraOffset[1]])
const pointInObj = (point, obj) => ((point[0] >= obj.position[0]) && point[1] >= obj.position[1] && point[0] <= obj.position[0] + obj.dimensions[0] && point[1] <= obj.position[1] + obj.dimensions[1]);

window.addEventListener('resize', _ => {
    resizeOrZoom();
})

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.show([e.offsetX, e.offsetY], selectedObjectData);
});

window.addEventListener('wheel', (e) => {

    let mouseWorldPos0 = screenPosToWorldPos([e.clientX, e.clientY]);

    let deltaY = Math.sign(e.deltaY) * getZoomVelocity();

    let potentialZoom = zoomScale + deltaY;

    if (potentialZoom >= zoomRestrictions.minimum && potentialZoom <= zoomRestrictions.maximum) {
        zoomScale = potentialZoom;

        resizeOrZoom();

        let mouseWorldPos1 = screenPosToWorldPos([e.clientX, e.clientY]);
        for (let i in cameraOffset) {
            cameraOffset[i] -= mouseWorldPos0[i] - mouseWorldPos1[i];
        }
        resizeOrZoom();
    }

})

window.addEventListener('mousedown', e => {
    if (e.button === 0) {
        mouseData.isDown = true;
        mouseData.lastDownPos = [e.offsetX, e.offsetY];
        mouseData.target = e.target;
    }
})

window.addEventListener('mouseup', e => {
    if (e.target.id === 'editorCanvas') {
        let clickWorldPos = screenPosToWorldPos([e.clientX, e.clientY]);
        if (mouseoverObjectData.type == '') {
            selectedObjectData.reset();
        } else {
            selectedObjectData.loadObject(mouseoverObjectData.type + '', parseInt(mouseoverObjectData.index) + 0);
        }
        selectedObjectData.setClickPos(clickWorldPos);
    }
    mouseData.isDown = false;
    if (!contextMenu.isHidden) contextMenu.hide();
})

window.addEventListener('mousemove', e => {

    //mouse dragging navigation
    if (mouseData.isDown && !objectEditor.disableCamera && mouseData.target == canvas) {
        cameraOffset[0] += e.movementX / tileSize;
        cameraOffset[1] += e.movementY / tileSize;
    }

    //selecting gameObjects
    let mouseWorldPos = screenPosToWorldPos([e.clientX, e.clientY]);
    let triggered = false;

    let checkMOObject = (type, index) => {
        let obj = getGameObject(type, index);
        if (pointInObj(mouseWorldPos, obj)) {
            triggered = true;
            mouseoverObjectData.type = type;
            mouseoverObjectData.index = index;
        }
    }

    for (let i in loadedPlatforms) {
        checkMOObject('platform', i);
    }
    for (let i in loadedEntities) {
        if (triggered) break;
        checkMOObject('entity', i);
    }
    for (let i in loadedDoors) {
        if (triggered) break;
        checkMOObject('door', i);
    }

    if (!triggered) {
        mouseoverObjectData.type = '';
        mouseoverObjectData.index = 0;
    }
})

function resizeOrZoom() {
    tileSize = window.innerHeight / zoomScale;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const renderer = {

    worldPosToScreenPos: pos => [pos[0] * tileSize, pos[1] * tileSize],

    worldObjToScreenObj: obj => {
        return [(obj.position[0] + cameraOffset[0]) * tileSize, (obj.position[1] + cameraOffset[1]) * tileSize, (obj.dimensions[0]) * tileSize, (obj.dimensions[1]) * tileSize];
    },


    draw: function () {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        for (let i in loadedPlatforms) {
            let platform = loadedPlatforms[i];
            ctx.fillRect(...this.worldObjToScreenObj(platform));
        }

        for (let i in loadedDoors){
            let door = loadedDoors[i];
            ctx.drawImage(spriteImages.door, ...this.worldObjToScreenObj(door))
        }

        let drawOutline = (target, color, alpha) => {
            let rect = this.worldObjToScreenObj(target);
            let padding = 10;
            for (let i in rect) {
                if (i <= 1) {
                    rect[i] -= padding / 2;
                } else {
                    rect[i] += padding;
                }
            }
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(...rect);
            ctx.stroke();
            ctx.globalAlpha = 1;

        }

        let mouseoverIsSelected = (mouseoverObjectData.type === selectedObjectData.type) && (mouseoverObjectData.index === selectedObjectData.index);

        if (mouseoverObjectData.type !== '' && !mouseoverIsSelected) {
            let target = getGameObject(mouseoverObjectData.type, mouseoverObjectData.index);
            drawOutline(target, colors.mouseOverBorder, .5);
        }
        if (selectedObjectData.type !== '') {
            drawOutline(getGameObject(selectedObjectData.type, selectedObjectData.index), colors.selectedBorder, .5);
        }
    }
}

const levelLoader = {

    levels: [],

    currentLevelIndex: 0,

    initiated: false,

    getCurrentLevel: function () { return this.levels[this.currentLevelIndex] },

    setCurrentLevel: function (index) {
        this.initiated = true;
        if (index < this.levels.length) {
            let currentLevel = this.levels[index];
            this.currentLevelIndex = index;

            loadedPlatforms = [...currentLevel.platforms];
            loadedEntities = [...currentLevel.entities];
            loadedDoors = [...currentLevel.doors];
            loadedBoundsObjs = {
                startPos: new BoundsObject(currentLevel.playerStartPos, [1, 1], 'green'),
                levelBounds: new WorldBoundsObject(currentLevel.boundingBox[0], currentLevel.boundingBox[1])
            }

            //menuManager setup

            let playerStartPosElement = new MenuElement('Player Start Pos', loadedBoundsObjs.startPos, 'boundsObj', _=>{
                selectedObjectData.loadObject('boundsObj', 'startPos', null);
            })
            menuManager.addElement(playerStartPosElement);

            let levelBoundsElement = new MenuElement('Level Bounds', loadedBoundsObjs.startPos, 'boundsObj', _=>{
                selectedObjectData.loadObject('boundsObj', 'levelBounds', null);
            })
            menuManager.addElement(levelBoundsElement);


        }
    },

    loadLevel: function (levelJSON) {
        let levelObj = JSON.parse(levelJSON);
        console.log(levelObj);
        this.levels.push(levelObj);
        if (!this.initiated) { this.setCurrentLevel(0) };
    },

    updateLevel: function () {
        this.levels[this.currentLevelIndex].entities = loadedEntities;
        this.levels[this.currentLevelIndex].doors = loadedDoors;
        this.levels[this.currentLevelIndex].platforms = loadedPlatforms;
        console.log(this.getCurrentLevel())
    },

    exportLevel: function (title, fileName = "level") {
        let currentLevel = this.getCurrentLevel();

        let levelJSON = JSON.stringify(currentLevel);

        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(levelJSON);
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", fileName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

    }


}

function start() {
    resizeOrZoom();
    window.requestAnimationFrame(update);
}

function update() {
    renderer.draw();
    window.requestAnimationFrame(update);
}


function updateMenu() {

}

//level loading init VVVV

// let sampleLevelsOBJ = generateLevels(40);
// let sampleLevelsList = [];
// for(let i in sampleLevelsOBJ){sampleLevelsList.push(sampleLevelsOBJ[i])}

// levelLoader.levels = sampleLevelsList;

// levelLoader.setCurrentLevel(0);

//context menu init VVVV

const ctxButtonList = [];

const ctxBtnConditionals = { //stores repeat conditional functions
    freeSpace: targetData => (targetData.type === ''),
    anyObject: targetData => (targetData.type !== ''),
    alwaysTrue: _ => true,
};

ctxButtonList.push(new ContextButton("Test", ctxBtnConditionals.anyObject, targetData => {
    console.log(targetData)
}));

ctxButtonList.push(new ContextButton("Delete", ctxBtnConditionals.anyObject, targetData => {
    //REMINDER: this will only delete objects from the current view
    deleteGameObject(targetData.type, targetData.index);
    levelLoader.updateLevel();
    selectedObjectData.reset();
}))

ctxButtonList.push(new ContextButton("Add platform", ctxBtnConditionals.freeSpace, targetData => {
    loadedPlatforms.push(new Platform(selectedObjectData.getClickPosition(), [1, 1]));
    levelLoader.updateLevel();
}));

contextMenu.init(ctxButtonList);

start();