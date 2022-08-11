
const canvas = document.querySelector('#editorCanvas');
const ctx = canvas.getContext('2d');

var zoomScale = 30;

var tileSize = window.innerHeight / zoomScale;

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

    }
}

const levelLoader = {
    
}

