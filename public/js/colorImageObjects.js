const colors = {
    background: 'black',
    platform: 'white',
    player: 'white',
    door: '#00ff00',
    green: '#00ff00',
    selectedBorder: '#00ff00',
    mouseOverBorder: '#ff0000'
}

const imageSRCs = {
    door: 'door.png',
    rightFacingArrow: 'rightFacingArrow.png',
    leftFacingArrow: 'leftFacingArrow.png',
}

const spriteImages = {
}

for(let i in imageSRCs){
    let img = document.createElement('IMG');
    img.src = `textures/${imageSRCs[i]}`;
    spriteImages[i] = img;
}