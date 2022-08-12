
class Particle{
    
    /**
     * Creates a particle.
     * 
     * @param {[x, y]} position starting position of particle
     * @param {String} color color value of particle
     * @param {[x, y]} velocity starting x and y velocity of particle
     * @param {number} duration lifespan of particle (milliseconds) 
     */
    constructor(position, color = 'white', velocity = [(Math.random() - .5) * 50, (Math.random() - .5) * 50], duration = 2000){
        this.startTime = Date.now();
        this.position = position;
        this.color = color;
        this.velocity = velocity;
        this.duration = duration;
        this.gravity = 1;
        this.friction = .9;
        this.opacity = 1;

        this.finished = false;
    }

    update(deltaTime){
    
        this.velocity[0] -= (this.friction * this.velocity[0]) * (deltaTime / 1000);
        this.velocity[1] -= (this.friction * this.velocity[1]) * (deltaTime / 1000);

        this.velocity[1] += this.gravity * (deltaTime/1000);

        this.position[0] += this.velocity[0] * (deltaTime / 1000);
        this.position[1] += this.velocity[1] * (deltaTime / 1000);

        let lifespan = Date.now() - this.startTime;

        this.opacity = 1 - (lifespan/this.duration);

        if(lifespan > this.duration){
            this.finished = true;
        }

    }
}

const particleManager = {
    currentParticles: [],
    
    createParticle: function(position, color = 'white'){

        this.currentParticles.push(new Particle([...position], color));

    },

    /**
     * Creates a cluster of particles.
     * 
     * @param {[x, y]} position 
     * @param {number} count 
     * @param {string} color 
     */

    createParticleCluster: function (position, count = 10, color = 'white'){
        for(let i = 0; i < count; i++){
            this.currentParticles.push(new Particle([...position], color));

        }
    },

    update: function(deltaTime){
        for(let i in this.currentParticles){

            let particle = this.currentParticles[i];

            if(particle.finished){

                this.currentParticles.splice(i, 1);

            }else{

                this.currentParticles[i].update(deltaTime);
            
            }

        }
    }
}