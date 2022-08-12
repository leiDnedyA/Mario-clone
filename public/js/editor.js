
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

const screenPosToWorldPos = pos=>([(pos[0] / tileSize) - cameraOffset[0], (pos[1] / tileSize) - cameraOffset[1]])

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
    if(mouseData.isDown){
        cameraOffset[0] += e.movementX / tileSize;
        cameraOffset[1] += e.movementY / tileSize;
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