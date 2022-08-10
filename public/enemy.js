
/**
 * BasicEnemy enemies are set to simply walk around within a certain range.
 */
class BasicEnemy extends Entity{
    /**
     * Creates an Enemy instance.
     * 
     * @param {[x, y]} position position of enemy.
     * @param {number} maxSpeed maximum speed of enemy.
     * @param {number} walkRange how far the enemy will wander from its original position.
     * @param {boolean} walksOffPlatforms whether or not enemy walks off platforms.
     * @param {{left: string, right: string}} sprites object with keys pointing to the enemy's sprite in different scenarios
     */
    constructor(position, maxSpeed, walkRange = 3, walksOffPlatforms = false, sprites = {left: 'leftFacingArrow', right: 'rightFacingArrow'}){
        super(position, maxSpeed);
        this.walkRange = walkRange;
        this.startPosition = [...position];
        this.walksOffPlatforms = walksOffPlatforms;
        this.acceleration = 0;
        this.color = "#ff2233";
        this.sprites = sprites;
        this.sprite = sprites.right;
        this.xAxisDirection = 1; //-1: left, 1: right (multiplier for x axis velocity)
        this.setXDirection(1);
    }

    /**
     * sets direction of enemy.
     * 
     * @param {number} xAxisDirection direction on x axis, either -1 for left or 1 for right.
     */
    setXDirection(xAxisDirection){
        this.xAxisDirection = xAxisDirection;
        this.velocity[0] = this.maxSpeed * this.xAxisDirection;
        if(xAxisDirection === -1){
            this.sprite = this.sprites.left;
        }else{
            this.sprite = this.sprites.right;
        }
    }

    update(deltaTime){

        if(Math.abs(this.position[0] - this.startPosition[0]) >= this.walkRange){
            this.setXDirection(this.xAxisDirection * -1);
        }

        super.update(deltaTime);
    }
}