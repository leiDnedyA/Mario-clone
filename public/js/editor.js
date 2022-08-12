
const canvas = document.querySelector('#editorCanvas');
const ctx = canvas.getContext('2d');

var zoomScale = 30;

var tileSize = window.innerHeight / zoomScale;

var loadedPlatforms = [];
var loadedEntities = [];

window.addEventListener('resize', _=>{
    resizeOrZoom();
})

function resizeOrZoom(){
    tileSize = window.innerHeight / zoomScale;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const renderer = {
    draw: function(){
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

const levelLoader = {

    levels: [],

    loadLevel: function(level){

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





start();