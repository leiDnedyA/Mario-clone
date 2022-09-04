
class BoundsObject{
    constructor(position, dimensions, color = '#88eeff'){
        this.position = position;
        this.dimensions = dimensions;
        this.color = color;
        this.visibility = false;
    }

    setVisibility(isVisible){
        this.visibility = isVisible;
    }

    getPosition(){
        return this.position;
    }

    getDimensions(){
        return this.dimensions;
    }

    update(){

    }

}

// This is going to be a pain in the ass to write 
class WorldBoundsObject extends BoundsObject{
    constructor(topLeft, bottomRight){
        super(topLeft, [bottomRight[0]-topLeft[0], bottomRight[1]-topLeft[1]], '#ffaaaa');
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
    }

    update(){
        super.update();
        this.topLeft = [...this.position];
        this.bottomRight = [this.position[0]+this.dimensions[0], this.position[1]+this.dimensions[1]];
    }

}