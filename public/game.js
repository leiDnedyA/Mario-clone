
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


var tileSize = canvas.height / 25;

const entities = [];

var deltaTime = 0;
var lastTime = Date.now();

const loadedPlatforms = [];

window.addEventListener('resize', e=>{canvas.width = window.innerWidth; canvas.height = window.innerHeight; tileSize = canvas.height / 25;});

class Platform {
    constructor(position = [0, 0], dimensions = [0, 0]){
        this.position = position;
        this.dimensions = dimensions;
    }
}

class Entity {
    constructor(position = [0, 0], maxSpeed){
        this.position = position;
        this.dimensions = [1, 1]
        this.velocity = [0, 0];
        this.isGrounded = false;
        this.maxSpeed = maxSpeed;
        this.minSpeed = .001;
    
        this.lastGroundTime = Date.now();

        this.gravity = 100;
    
    }

    /**
     * Checks for collisions between entity and loaded platforms.
     * 
     * @param {[number, number]} potentialPosition [x, y] the next position that the entity would be in based on its current velocity ignoring collisions
     * 
     * @return {[number, number]} [x, y] actual next position that the entity will be in based on collisions
     */
    checkCollisions(potentialPosition){

        let result = [...potentialPosition];

        //checks if collision occurs at certain position and returns true or false
        let positionTest = (pos, platform)=>{

            //the names of these variables reference direction from the entity's perspective
            let positiveXCollision = (pos[0] + this.dimensions[0] > platform.position[0]);
            let negativeXCollision = (pos[0] < platform.position[0] + platform.dimensions[0]);
            let positiveYCollision = (pos[1] + this.dimensions[1] > platform.position[1]);
            let negativeYCollision = (pos[1] < platform.position[1] + platform.dimensions[1]);

            return (positiveXCollision && negativeXCollision && positiveYCollision && negativeYCollision);

        }

        for(let i in loadedPlatforms){
            let platform = loadedPlatforms[i];

            if (positionTest(result, platform)){
                
                if (positionTest([this.position[0], result[1]], platform)){

                    if (this.position[1] < potentialPosition[1]) {
                        result[1] = platform.position[1] - this.dimensions[1];
                    } else {
                        result[1] = platform.position[1] + platform.dimensions[1];
                    }

                }else{
                    if(this.position[0] < potentialPosition[0]){
                        result[0] = platform.position[0]-this.dimensions[0];
                    }else{
                        result[0] = platform.position[0] + platform.dimensions[0];
                    }
                }

            }

        }

        return result;

    }

    update(deltaTime){

        console.log(this.isGrounded)

        //gravity stuff

        let groundedTestPos = [this.position[0], this.position[1] + .01];
        let groundedCollisionTest = this.checkCollisions(groundedTestPos);

        if(groundedCollisionTest[1] === groundedTestPos[1]){
            this.isGrounded = false;
            this.velocity[1] += this.gravity * deltaTime/1000;
        }else{
            this.isGrounded = true;
        }


        //collision and movement stuff

        let potentialPosition = [this.position[0] + (this.velocity[0] * deltaTime/1000), this.position[1] + (this.velocity[1]*deltaTime/1000)];

        let collisionResult = this.checkCollisions(potentialPosition);

        if(collisionResult[0] !== potentialPosition[0] && collisionResult[1] !== potentialPosition[1]){

            //sets velocity to 0 on axis that collision occured

            if(potentialPosition[0] !== collisionResult[0]){
                this.velocity[0] = 0;
            }else{
                this.velocity[1] = 0;
            }

        }

        this.position = collisionResult;

    }
}

class Player extends Entity {
    constructor(position){
        super(position, 50);

        this.acceleration = 150;
        this.jumpPower = 40;
        this.earlyJumpTimer = 300; //millisecond buffer for if player presses jump button before hitting ground
        this.lateJumpTimer = 25; //millisecond buffer for if player presses jump button after leaving ground

        this.lastJumpRequest = Date.now();
        this.checkJumpRequest = false;

    }

    processInput(xAxisValue){

        if (xAxisValue === 0) {

            //decelerate (friction)

            const friction = 3;
            let xSpeed = Math.abs(this.velocity[0]);
            let reducedSpeed = xSpeed - friction;

            if (reducedSpeed < 0) {
                reducedSpeed = 0;
            }

            this.velocity[0] = reducedSpeed * Math.sign(this.velocity[0]);


        } else {

            //accelerate

            const skidSpeed = 5; //increases acceleration when player is trying to change direction

            let accelerationMultiplier = 1;

            if (Math.sign(xAxisValue) !== Math.sign(this.velocity[0])) {
                accelerationMultiplier = skidSpeed;
            }

            let potentialXVelocity = this.velocity[0] + (xAxisValue * this.acceleration * accelerationMultiplier * deltaTime / 1000);

            if (potentialXVelocity > this.maxSpeed) {
                this.velocity[0] = this.maxSpeed;
            } else if (potentialXVelocity < -this.maxSpeed) {
                this.velocity[0] = -this.maxSpeed;
            } else {
                this.velocity[0] = potentialXVelocity;
            }

        }
    }

    jump() {
        this.velocity[1] = -this.jumpPower;
    }

    tryJump() {
        if (this.isGrounded || Date.now() - this.lastGroundTime <= this.lateJumpTimer) {
            this.jump();
        }else{
            this.checkJumpRequest = true;
            this.lastJumpRequest = Date.now();
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        //jumps in case of early button press within jumpTimer limit
        if(this.checkJumpRequest){
            if(Date.now() - this.lastJumpRequest <= this.earlyJumpTimer){
                if(this.isGrounded){
                    this.jump();
                }
            }else{
                this.checkJumpRequest = false;
            }
        }

    }
}

const charController = {
    keysDown: {
        "KeyA": false,
        "KeyD": false,
        "Space": false
    },

    //keys that are being pressed but not held down
    eventKeys: {
        "Space": ()=>{
            player.tryJump();
        }
    },

    changeKeyStatus : function(e){
        let code = e.code;

        let isKeyDown = e.type === "keydown";

        for (let i in this.eventKeys) {
            if (i === code && !this.keysDown[i] && isKeyDown) {
                this.eventKeys[i]();
            }
        }

        for(let i in this.keysDown){
            if(i === code){
                this.keysDown[code] = isKeyDown;
            }
        }

    },

    init: function(){
        window.addEventListener("keydown", e=>{this.changeKeyStatus(e)});
        window.addEventListener("keyup", e=>(this.changeKeyStatus(e)));
    },

    update : function(){
        let xAxisValue = ((this.keysDown.KeyD) ? 1 : 0) + ((this.keysDown.KeyA) ? -1 : 0);

        player.processInput(xAxisValue);

    }
};

const renderer = {
    
    worldObjToScreenObj: obj=>{
        return [obj.position[0]*tileSize, obj.position[1]*tileSize, obj.dimensions[0]*tileSize, obj.dimensions[1]*tileSize];
    },

    draw: function(){

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#000000";

        for(let i in loadedPlatforms){
            ctx.fillRect(...this.worldObjToScreenObj(loadedPlatforms[i]));
        }
        
        ctx.fillStyle = "#ff0000";

        ctx.fillRect(...this.worldObjToScreenObj(player));

    }
};

function getCanvasPosition(worldPos){
    return [worldPos[0] * tileSize, worldPos[1] * tileSize];
}

function update(){

    let currentTime = Date.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    renderer.draw();
    charController.update();
    player.update(deltaTime);

    window.requestAnimationFrame(update);

}

charController.init();

const player = new Player([10, 10]);
loadedPlatforms.push(new Platform([10, 11], [25, 1]));
loadedPlatforms.push(new Platform([15, 6], [25, 1]));
loadedPlatforms.push(new Platform([15, 10], [1, 1]));

window.requestAnimationFrame(update);
