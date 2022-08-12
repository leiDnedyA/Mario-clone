class Entity {
    constructor(position = [0, 0], maxSpeed) {
        this.position = position;
        this.dimensions = [1, 1]
        this.velocity = [0, 0];
        this.isGrounded = false;
        this.maxSpeed = maxSpeed;
        this.minSpeed = .001;

        this.lastGroundTime = Date.now();

        this.gravity = 40;

    }

    positionTest(pos, platform) {

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
    checkCollisions(potentialPosition) {

        let result = [...potentialPosition];

        for (let i in loadedPlatforms) {
            let platform = loadedPlatforms[i];

            if (this.positionTest(result, platform)) {

                if (this.positionTest([this.position[0], result[1]], platform)) {

                    if (this.position[1] < potentialPosition[1]) {
                        result[1] = platform.position[1] - this.dimensions[1];
                    } else {
                        result[1] = platform.position[1] + platform.dimensions[1];
                    }

                } else {
                    if (this.position[0] < potentialPosition[0]) {
                        result[0] = platform.position[0] - this.dimensions[0];
                    } else {
                        result[0] = platform.position[0] + platform.dimensions[0];
                    }
                }

            }

        }

        return result;

    }

    update(deltaTime) {

        //gravity stuff

        let groundedTestPos = [this.position[0], this.position[1] + .05];
        let groundedCollisionTest = this.checkCollisions(groundedTestPos);

        if (groundedCollisionTest[1] < groundedTestPos[1]) {

            this.isGrounded = true;

        } else {

            if (this.isGrounded) {
                this.lastGroundTime = Date.now();
            }
            this.isGrounded = false;
            this.velocity[1] += this.gravity * deltaTime / 1000;

        }


        //collision and movement stuff

        let potentialPosition = [this.position[0] + (this.velocity[0] * deltaTime / 1000), this.position[1] + (this.velocity[1] * deltaTime / 1000)];

        let collisionResult = this.checkCollisions(potentialPosition);


        //sets velocity to 0 on axis that collision occured

        if (potentialPosition[0] !== collisionResult[0]) {
            this.velocity[0] = 0;
        } else if (potentialPosition[1] !== collisionResult[1]) {
            this.velocity[1] = 0;
        }

        this.position = collisionResult;

    }
}