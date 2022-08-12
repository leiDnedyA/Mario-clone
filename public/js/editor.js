
const canvas = document.querySelector('#editorCanvas');
const ctx = canvas.getContext('2d');

var zoomScale = 50;
var cameraOffset = [0, 0]

var tileSize = window.innerHeight / zoomScale;

var loadedPlatforms = [];
var loadedEntities = [];
var loadedDoors = [];

window.addEventListener('resize', _=>{
    resizeOrZoom();
})
window.addEventListener('wheel', (e)=>{
    let deltaY = Math.sign(e.deltaY);
    console.log(deltaY);
    zoomScale += deltaY;
    resizeOrZoom();
})

function resizeOrZoom(){
    tileSize = window.innerHeight / zoomScale;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const renderer = {

    worldPosToScreenPos: pos => [pos[0] * tileSize, pos[1] * tileSize],

    worldObjToScreenObj: obj => {
        return [(obj.position[0] + cameraOffset[0]) * tileSize, (obj.position[1] + cameraOffset[1]) * tileSize, (obj.dimensions[0] + cameraOffset[0]) * tileSize, (obj.dimensions[1] + cameraOffset[1]) * tileSize];
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