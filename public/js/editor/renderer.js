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