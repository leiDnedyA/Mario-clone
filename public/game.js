
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tilesVisibleVertically = 40;

var tileSize = canvas.height / tilesVisibleVertically;
var particleSize = 3;

var particleMultiplier = 1.5;

var entities = [];
var loadedPlatforms = [];
var loadedDoors = [];

var cameraOffset = [0, 0]; //will probably implement later

var deltaTime = 0;
var lastTime = Date.now();

var userHasInteracted = false;

const colors = {
    background: 'black',
    platform: 'white',
    player: 'white',
    door: '#00ff00',
    green: '#00ff00'
}

const imageSRCs = {
    door: 'door.png',
}

const spriteImages = {
}

for(let i in imageSRCs){
    let img = document.createElement('IMG');
    img.src = `textures/${imageSRCs[i]}`;
    spriteImages[i] = img;
}

window.addEventListener('click', _ => { userHasInteracted = true}, {once: true});
window.addEventListener('keydown', _=>{ userHasInteracted = true}, {once: true});

window.addEventListener('contextmenu',e=>{e.preventDefault()});

window.addEventListener('resize', e=>{canvas.width = window.innerWidth; canvas.height = window.innerHeight; tileSize = canvas.height / tilesVisibleVertically;});

class Level {

    /**
     * Creates new Level instance.
     * 
     * @param {[Entity]} entities list of entities in level 
     * @param {[Platform]} platforms list of platforms in level
     * @param {[x, y]} playerStartPos starting position of player in level
     * @param {[[x, y], [width, height]]} boundingBox bounding box of level.
     * @param {string} backgroundMusic name of background track for level.
     * @param {[PositionEvent]} positionEvents list of position triggers in level.
     * @param {[Door]} doors list of doors in level.
     */
    constructor(entities = [], platforms = [], playerStartPos = [0, 0], boundingBox = [[0, 0], [tilesVisibleVertically * 1.5, tilesVisibleVertically]], backgroundMusic = 'backgroundPiano', positionEvents = [], doors = []){
        this.entities = entities;
        this.platforms = platforms;
        this.playerStartPos = playerStartPos;
        this.boundingBox = boundingBox;
        this.backgroundMusic = backgroundMusic;
        this.positionEvents = positionEvents;
        this.doors = doors;
    }
}

class Platform {
    constructor(position = [0, 0], dimensions = [0, 0]){
        this.position = position;
        this.dimensions = dimensions;
    }
}

class Door {
    constructor(position = [0, 0], dimensions = [1, 1], destinationLevelIndex = 0, exitPosition = [10, 10]){
        this.position = position;
        this.dimensions = dimensions;
        this.destinationLevelIndex = destinationLevelIndex;
        this.exitPosition = exitPosition;
    }
}

// class used to store position-based events within levels e.g player walks over a tile and text appears
class PositionEvent {

    /**
     * Creates PositionEvent instance.
     * 
     * @param {[x, y]} position position that event occurs at
     * @param {PositionEvent~posEventCallback} callback function that executes when event is triggered
     * @param {[x, y]} range range within which the event can be triggered
     * @param {boolean} isRepeatable whether or not the event is a one-time thing or repeats
     * @param {number} repeatDelay millisecond delay between repeats if applicable
     */
    constructor(position = [0, 0], callback, range = [5, 5], isRepeatable = true, repeatDelay = 5000){
        this.position = position;
        this.callback = callback;
        this.range = range;
        this.isRepeatable = isRepeatable;
        this.repeatDelay = repeatDelay;
        this.lastExecution = 0;
        this.hasExecuted = false;
    }

    /**
     * Tests conditions for event and executes if conditions are met.
     * 
     * @param {[x, y]} playerPosition current position of player
     */
    tryExecution(playerPosition){
        if((this.isRepeatable && Date.now() - this.lastExecution >= this.repeatDelay) || (!this.isRepeatable && !this.hasExecuted)){
            let xPosCheck = playerPosition[0] >= this.position[0] - this.range[0] && playerPosition[0] <= this.position[0] + this.range[0];
            let yPosCheck = playerPosition[1] >= this.position[1] - this.range[1] && playerPosition[1] <= this.position[1] + this.range[1];
            if(xPosCheck && yPosCheck){
                this.execute(playerPosition);
            }
        }
    }

    /**
     * Executes callback function for event.
     * 
     * @param {[x, y]} playerPosition current position of player
     */
    execute(playerPosition){
        this.callback(playerPosition);
        this.hasExecuted = true;
        this.lastExecution = Date.now();
    }
}
/**
 * Callback function used in PositionEvent class.
 * @callback PositionEvent~posEventCallback
 * @param {[x, y]} playerPosition current position of player.
 */

class Entity {
    constructor(position = [0, 0], maxSpeed){
        this.position = position;
        this.dimensions = [1, 1]
        this.velocity = [0, 0];
        this.isGrounded = false;
        this.maxSpeed = maxSpeed;
        this.minSpeed = .001;
    
        this.lastGroundTime = Date.now();

        this.gravity = 40;
    
    }

    positionTest(pos, platform){

        //the names of these variables reference direction from the entity's perspective
        let positiveXCollision = (pos[0] + this.dimensions[0] > platform.position[0]);
        let negativeXCollision = (pos[0] < platform.position[0] + platform.dimensions[0]);
        let positiveYCollision = (pos[1] + this.dimensions[1] > platform.position[1]);
        let negativeYCollision = (pos[1] < platform.position[1] + platform.dimensions[1]);

        return (positiveXCollision && negativeXCollision && positiveYCollision && negativeYCollision);

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

        for(let i in loadedPlatforms){
            let platform = loadedPlatforms[i];

            if (this.positionTest(result, platform)){
                
                if (this.positionTest([this.position[0], result[1]], platform)){

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

        //gravity stuff

        let groundedTestPos = [this.position[0], this.position[1] + .05];
        let groundedCollisionTest = this.checkCollisions(groundedTestPos);

        if(groundedCollisionTest[1] < groundedTestPos[1]){

            this.isGrounded = true;

        }else{

            if (this.isGrounded) {
                this.lastGroundTime = Date.now();
            }
            this.isGrounded = false;
            this.velocity[1] += this.gravity * deltaTime / 1000;

        }


        //collision and movement stuff

        let potentialPosition = [this.position[0] + (this.velocity[0] * deltaTime/1000), this.position[1] + (this.velocity[1]*deltaTime/1000)];

        let collisionResult = this.checkCollisions(potentialPosition);


        //sets velocity to 0 on axis that collision occured

        if (potentialPosition[0] !== collisionResult[0]) {
            this.velocity[0] = 0;
        } else if(potentialPosition[1] !== collisionResult[1]) {
            this.velocity[1] = 0;
        }

        this.position = collisionResult;

    }
}

class Player extends Entity {
    constructor(position){
        super(position, 50);

        this.acceleration = 80;
        this.jumpPower = 30;
        this.earlyJumpTimer = 300; //millisecond buffer for if player presses jump button before hitting ground
        this.lateJumpTimer = 150; //millisecond buffer for if player presses jump button after leaving ground

        this.lastJumpRequest = Date.now();
        this.checkJumpRequest = false;
        this.lastJump = Date.now();

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

        let velocityParticleFactor = (Math.abs(this.velocity[1]) + Math.abs(this.velocity[0])) / 30;

        this.velocity[1] = -this.jumpPower;
        audioManager.playSoundEffect('jump0');
        particleManager.createParticleCluster(this.position, (10 * particleMultiplier) * (1 + velocityParticleFactor), 'white');
        this.lastJump = Date.now();
    }

    die() {

        //makes red particles where player died or on edge of screen if player is offscreen
        let particlesPosition = [...this.position];

        let bounds = [[cameraOffset[0], cameraOffset[1]], [canvas.width / tileSize, canvas.height / tileSize]]

        if (!pointInBox(this.position, bounds)) {
            if (particlesPosition[0] < bounds[0][0]) {
                particlesPosition[0] = bounds[0][0];
            } else if (particlesPosition[0] > bounds[1][0]) {
                particlesPosition[0] = bounds[1][0] + bounds[0][0];
            }

            if (particlesPosition[1] < bounds[0][1]) {
                particlesPosition[1] = bounds[1][0];
            } else if (particlesPosition[1] > bounds[1][1]) {
                particlesPosition[1] = bounds[1][1] + bounds[0][1];
            }
        }

        particleManager.createParticleCluster(particlesPosition, 10 * particleMultiplier, 'red');

        //relocates player

        this.position = levelManager.getCurrentLevel().playerStartPos;
        this.velocity = [0, 0];
        audioManager.playSoundEffect('death1');


    }

    doorRequest(){
        for(let i in loadedDoors){
            let d = loadedDoors[i];

            if(super.positionTest(this.position, d)){
                levelManager.loadLevel(d.destinationLevelIndex);
                this.position = [...d.exitPosition];
                audioManager.playSoundEffect('door1');
                particleManager.createParticleCluster([...player.position], 10, colors.green);
            }

        }
    }

    tryJump() {

        let jumpDelay = Date.now() - this.lastJump;

        if (this.isGrounded) {
            //normal jump
            this.jump();
        } else if (Date.now() - this.lastGroundTime <= this.lateJumpTimer && jumpDelay > 200){
            //late jump
            this.jump();
        }else{
            //setup for early jump
            this.checkJumpRequest = true;
            this.lastJumpRequest = Date.now();
        }
    }


    update(deltaTime) {
        //jumps in case of early button press within jumpTimer limit
        if (this.checkJumpRequest) {
            if (Date.now() - this.lastJumpRequest <= this.earlyJumpTimer) {
                if (this.isGrounded) {
                    this.jump();
                }
            } else {
                this.checkJumpRequest = false;
            }
        }
        
        super.update(deltaTime);

        if(!pointInBox(this.position, levelManager.getCurrentLevel().boundingBox)) this.die();

    }
}

const charController = {
    keysDown: {
        "KeyA": false,
        "KeyD": false,
        "KeyW": false,
        "Space": false
    },

    //keys that are being pressed but not held down
    eventKeys: {
        "Space": ()=>{
            player.tryJump();
        },
        "KeyW": ()=>{
            player.doorRequest();
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
    
    worldPosToScreenPos: pos=>[pos[0]*tileSize, pos[1]*tileSize],

    worldObjToScreenObj: obj=>{
        return [obj.position[0]*tileSize, obj.position[1]*tileSize, obj.dimensions[0]*tileSize, obj.dimensions[1]*tileSize];
    },

    draw: function(){

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for(let i in textManager.currentTexts){
            let t = textManager.currentTexts[i];

            ctx.fillStyle = t.color;
            ctx.globalAlpha = t.opacity;
            ctx.font = `${t.size * tileSize}px ${t.font}`;
            let screenPos = this.worldPosToScreenPos(t.position);

            ctx.fillText(t.message, screenPos[0], screenPos[1]);

        }

        ctx.globalAlpha = 1;

        ctx.fillStyle = colors.platform;

        for(let i in loadedPlatforms){
            ctx.fillRect(...this.worldObjToScreenObj(loadedPlatforms[i]));
        }

        for(let i in loadedDoors){
            let screenObj = this.worldObjToScreenObj(loadedDoors[i]);
            
            ctx.drawImage(spriteImages.door, ...screenObj);

        }

        ctx.fillStyle = colors.player;

        ctx.fillRect(...this.worldObjToScreenObj(player));

        for(let i in particleManager.currentParticles){
            
            let particle = particleManager.currentParticles[i];
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = Math.abs(particle.opacity);

            let screenObj = [...this.worldPosToScreenPos(particle.position)];
            screenObj.push(particleSize);
            screenObj.push(particleSize);

            ctx.fillRect(...screenObj);

        }

        ctx.globalAlpha = 1;

    }
};

const levelManager = {

    currentLevelIndex: null,

    levels: [],

    loadLevel: function(index){
        if(this.levels.length > index){

            this.currentLevelIndex = index;

            let level = this.levels[index];
            entities = [];
            loadedPlatforms = [];
            loadedDoors = [];

            for(let i in level.platforms){
                loadedPlatforms.push(level.platforms[i]);
            }

            for(let i in level.entities){
                entities.push(level.entities[i]);
            }

            for(let i in level.doors){
                loadedDoors.push(level.doors[i]);
            }

            if(level.backgroundMusic){
                audioManager.setMusic(level.backgroundMusic);
            }else{
                audioManager.pauseMusic();
            }

            player.position = [...level.playerStartPos];
            textManager.clearAllTexts();

        }else{
            console.log(`WARNING: level attempted to load at index ${index} does not exist!`);
        }
    },

    start: function(){
        this.loadLevel(0);
    },

    update: function(deltaTime){
        let posEvents = this.getCurrentLevel().positionEvents;
        for(let i in posEvents){
            let e = posEvents[i];
            e.tryExecution([...player.position]);
        }
    },

    getCurrentLevel: function () { return this.levels[this.currentLevelIndex]; }

}

const audioManager = {

    soundEffects: {},

    music: {},

    currentSongName: null,

    pauseMusic: function(){
        if(this.music.hasOwnProperty(this.currentSongName)){

            this.music[this.currentSongName].pause();
        }
    },

    playSoundEffect: function (effectName) {
        if(this.soundEffects.hasOwnProperty(effectName)){
            let sound = this.soundEffects[effectName];

            if(!sound.ended){
                let audioClone = new Audio(sound.src);
                audioClone.addEventListener('canplay', ()=>{
                    audioClone.play();
                });
                audioClone.addEventListener('ended', ()=>{
                    audioClone.remove();
                })
            }

            sound.play();
            
        }else{
            console.log(`WARNING: sound effect '${effectName}' was requested to play but does not exist!`);
        }
    },

    setMusic: function (songName) {
        
        if (songName !== this.currentSongName){
            if (this.music.hasOwnProperty(songName)) {

                if (this.currentSongName) {
                    this.music[this.currentSongName].pause();
                }

                let song = this.music[songName];

                if (userHasInteracted) {
                    song.play();
                } else {
                    window.addEventListener('keydown', _ => { song.play() }, { once: true });
                }


            } else {
                console.log(`WARNING: song '${songName}' was requested to play but does not exist!`);
            }
        }

    },

    /**
     * Loads in library of songs
     * 
     * @param {[{title: String, fileName: String}]} library 
     */
    loadLibrary: function(library) {
        for(let i in library){
            let songData = library[i];

            if(songData.category === 'music'){
                let audio = new Audio(`sfx/${songData.fileName}`);
                audio.loop = true;
                this.music[songData.title] = audio;
            }else if (songData.category === 'sfx'){
                this.soundEffects[songData.title] = new Audio(`sfx/${songData.fileName}`);
                this.soundEffects[songData.title].volume = 0;
                this.soundEffects[songData.title].addEventListener('ended', _=>{this.soundEffects[songData.title].volume = 1});
                this.soundEffects[songData.title].play();
            }

        }
    }
}

const textManager = {
    
    currentTexts: [],

    createText: function(message, position, size = 1, duration = 2000){
        this.currentTexts.push(new OnscreenText(message, position, size, duration));
    },

    clearAllTexts: function(){
        this.currentTexts = [];
    },

    update: function(deltaTime){
        for(let i in this.currentTexts){
            let t = this.currentTexts[i];
            t.update(deltaTime);
            if (t.finished){
                this.currentTexts.splice(i, 1);
            }
        }
    }
}

function getCanvasPosition(worldPos){
    return [worldPos[0] * tileSize, worldPos[1] * tileSize];
}

function start(){

    levelManager.start();

    window.requestAnimationFrame(update);

}

function update(){

    let currentTime = Date.now();
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    renderer.draw();
    textManager.update(deltaTime);
    charController.update();
    particleManager.update(deltaTime);
    player.update(deltaTime);
    levelManager.update(deltaTime);

    window.requestAnimationFrame(update);

}

/**
 * Checks whether a point is within a box.
 * 
 * @param {[x, y]} point 
 * @param {[[x, y], [width, height]]} box 
 * @returns {boolean}
 */
const pointInBox = (point, box) => (point[0] >= box[0][0] && point[0] <= box[0][0] + box[1][0] && point[1] >= box[0][1] && point[1] <= box[0][1] + box[1][1])

charController.init();

const player = new Player();

//categories include 'music' and 'sfx'
const musicLibrary = [
    { title: 'backgroundPiano', fileName: 'classical music background.wav', category: 'music' }, 
    { title: 'harpsicordIntro', fileName: 'anita-harpsichord-intro.wav', category: 'sfx'},
    { title: 'jump0', fileName: 'jump0.wav', category: 'sfx' },
    { title: 'jump1', fileName: 'jump1.wav', category: 'sfx' },
    { title: 'trapBackground', fileName: 'trap background.wav', category: 'music'},
    { title: 'death0', fileName: 'death0.wav', category: 'sfx'},
    { title: 'death1', fileName: 'death1.wav', category: 'sfx' },
    { title: 'door1', fileName: 'door1.wav', category: 'sfx'},
];
audioManager.loadLibrary(musicLibrary);

let sampleLevelPlatforms = [];

sampleLevelPlatforms.push(new Platform([10, 11], [25, 1]));
sampleLevelPlatforms.push(new Platform([15, 6], [25, 1]));
sampleLevelPlatforms.push(new Platform([20, 3], [25, 1]));
sampleLevelPlatforms.push(new Platform([40, 15], [4, 1]));
sampleLevelPlatforms.push(new Platform([15, 25], [4, 1]));
sampleLevelPlatforms.push(new Platform([15, 6], [25, 1]));
sampleLevelPlatforms.push(new Platform([30, 30], [25, 1]));

let samplePosEvent = new PositionEvent([40, 25], (playerPosition) => {textManager.createText('Use "A", "D", and Space to move', [...playerPosition])}, [5, 5], true, 1000);
let samplePosEvent2 = new PositionEvent([32, -3], (playerPosition) => { textManager.createText('Press "W" to enter the door!', [...playerPosition])}, [10, 6], true, 1000);
let samplePosEvent3 = new PositionEvent([18, 14], (playerPosition) => { textManager.createText('Ty for testing my game <3', [...playerPosition]) }, [10, 6], true, 1000);

let sampleDoor = new Door([34, 1], [1, 2], 1, [18, 10]);
let sampleDoor2 = new Door([16, 13], [1, 2], 0, [34, -1]);

levelManager.levels.push(new Level([], sampleLevelPlatforms, [40, 25], [[-10, -10], [2 * tilesVisibleVertically + 20, tilesVisibleVertically + 100]], 'backgroundPiano', [samplePosEvent, samplePosEvent2], [sampleDoor]));

levelManager.levels.push(new Level([], [new Platform([15, 15], [10, 1])], [18, 12], [[-10, -10], [2 * tilesVisibleVertically + 20, tilesVisibleVertically + 100]], 'backgroundPiano', [samplePosEvent3], [sampleDoor2]));

start();