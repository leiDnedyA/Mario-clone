
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
     * @param {string} sprite name of sprite.
     */
    constructor(position, maxSpeed, walkRange = 3, walksOffPlatforms = false, sprite = 'rightFacingArrow'){
        super(position, maxSpeed);
        this.walkRange = walkRange;
        this.startPosition = [...position];
        this.walksOffPlatforms = walksOffPlatforms;
        this.velocity[0] = maxSpeed;
        this.acceleration = 0;
        this.color = "#ff2233";
        this.sprite = sprite;
    }

    update(deltaTime){

        

        super.update(deltaTime);
    }
}