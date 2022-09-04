
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

}

// This is going to be a pain in the ass to write 
// class BoxBoundsObject extends BoundsObject{
//     constructor(topLeft, bottomRight){
//         super(topLeft, )
//     }

// }