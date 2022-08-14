
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
    lastDownPos: [0, 0],
}

var zoomScale = 50;
var cameraOffset = [0, 0]

const getZoomVelocity = _=>(zoomScale / 5);

var tileSize = window.innerHeight / zoomScale;

var loadedPlatforms = [];
var loadedEntities = [];
var loadedDoors = [];

const gameObjects = {
    platform: loadedPlatforms,
    entity: loadedEntities,
    door: loadedDoors
}

const getGameObject = (type, index)=>{
    switch(type){
        case 'platform':
            return loadedPlatforms[index];
        case 'entity':
            return loadedEntities[index];
        case 'door':
            return loadedDoors[index];
        default:
            return null;
    }
}

/**
 * selectedObjectData and mouseoverObjectData contain info about which game objects
 * are currently selected/moused over.
 * 
 * valid values of 'type' include 'platform', 'entity', and 'door'.
 * 'index' refers to the index of the gameObject in its respective list e.g loadedPlatforms, loadedEntities, loadedDoors.
 * 
 */
var selectedObjectData = {
    type: '',
    index: 0,
    isSelected: false,
}

var mouseoverObjectData = {
    type: '',
    index: 0
}

const screenPosToWorldPos = pos=>([(pos[0] / tileSize) - cameraOffset[0], (pos[1] / tileSize) - cameraOffset[1]])
const pointInObj = (point, obj)=>((point[0]>=obj.position[0]) && point[1]>=obj.position[1] && point[0]<= obj.position[0]+obj.dimensions[0] && point[1]<= obj.position[1]+ obj.dimensions[1]);

window.addEventListener('resize', _=>{
    resizeOrZoom();
})
window.addEventListener('wheel', (e)=>{

    let mouseWorldPos0 = screenPosToWorldPos([e.clientX, e.clientY]);

    let deltaY = Math.sign(e.deltaY) * getZoomVelocity();
    
    let potentialZoom = zoomScale + deltaY;

    if(potentialZoom >= zoomRestrictions.minimum && potentialZoom <= zoomRestrictions.maximum){
        zoomScale = potentialZoom;

        resizeOrZoom();

        let mouseWorldPos1 = screenPosToWorldPos([e.clientX, e.clientY]);
        for(let i in cameraOffset){
            cameraOffset[i] -= mouseWorldPos0[i] - mouseWorldPos1[i];
        }
        resizeOrZoom();
    }

})

window.addEventListener('mousedown', e=>{
    mouseData.isDown = true;
    mouseData.lastDownPos = [e.offsetX, e.offsetY];
})

window.addEventListener('mouseup', e=>{
    mouseData.isDown = false;
})

window.addEventListener('mousemove', e=>{
    
    //mouse dragging navigation
    if(mouseData.isDown){
        cameraOffset[0] += e.movementX / tileSize;
        cameraOffset[1] += e.movementY / tileSize;
    }

    //selecting gameObjects
    let mouseWorldPos = screenPosToWorldPos([e.clientX, e.clientY]);
    let triggered = false;

    let checkMOObject = (type, index)=>{
        let obj = getGameObject(type, index);
        if (pointInObj(mouseWorldPos, obj)) {
            triggered = true;
            mouseoverObjectData.type = type;
            mouseoverObjectData.index = index;
        }
    }

    for(let i in loadedPlatforms){
        checkMOObject('platform', i);
    }
    for(let i in loadedEntities){
        if(triggered) break;
        checkMOObject('entity', i);
    }
    for(let i in loadedDoors){
        if(triggered) break;
        checkMOObject('door', i);
    }

    if(!triggered){
        mouseoverObjectData.type = '';
        mouseoverObjectData.index = 0;
    }
})

function resizeOrZoom(){
    tileSize = window.innerHeight / zoomScale;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const renderer = {

    worldPosToScreenPos: pos => [pos[0] * tileSize, pos[1] * tileSize],

    worldObjToScreenObj: obj => {
        return [(obj.position[0] + cameraOffset[0]) * tileSize, (obj.position[1] + cameraOffset[1]) * tileSize, (obj.dimensions[0]) * tileSize, (obj.dimensions[1]) * tileSize];
    },


    draw: function(){
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        for(let i in loadedPlatforms){
            let platform = loadedPlatforms[i];
            ctx.fillRect(...this.worldObjToScreenObj(platform));
        }

        if(mouseoverObjectData.type !== ''){
            let target = getGameObject(mouseoverObjectData.type, mouseoverObjectData.index);
            let rect = this.worldObjToScreenObj(target);
            let padding = 10;
            for(let i in rect){
                if(i<=1){
                    rect[i]-=padding/2;
                }else{
                    rect[i]+=padding;
                }
            }
            ctx.strokeStyle = '#ff0000';
            ctx.globalAlpha = .5;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(...rect);
            ctx.stroke();
            ctx.globalAlpha = 1;
            
        }


    }
}

const levelLoader = {

    levels: [],

    currentLevelIndex: 0,

    loadLevel: function(index){
        if(index < this.levels.length){
            let currentLevel = this.levels[index];
            this.currentLevelIndex = index;

            loadedPlatforms = [...currentLevel.platforms];
            loadedEntities = [...currentLevel.entities];
            loadedDoors = [...currentLevel.doors];

        }
    },


}

function start(){
    resizeOrZoom();
    window.requestAnimationFrame(update);
}

function update(){
    renderer.draw();
    window.requestAnimationFrame(update);
}


let sampleLevels = generateLevels(tileSize);

levelLoader.levels.push(sampleLevels[0]);
levelLoader.levels.push(sampleLevels[1]);

levelLoader.loadLevel(0);

start();