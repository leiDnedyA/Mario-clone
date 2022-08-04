
class OnscreenText{

    /**
     * Creates an onscreen text instance.
     * 
     * @param {string} message 
     * @param {[x, y]} position 
     * @param {number} size size of text
     * @param {number} duration duration of text (milliseconds)
     * @param {number} opacity opacity of text (0 - 1)
     * @param {string} color color of text
     */
    constructor(message = 'sample text', position = [0, 0], size = 1, duration = 3000, opacity = .25, color = 'white'){
        this.message = message;
        this.font = 'serif';
        this.position = position;
        this.size = size;
        this.duration = duration;
        this.opacity = opacity;
        this.color = color;
        this.startTime = Date.now();
        this.finished = false;
    }

    update(deltaTime){
        if(Date.now() - this.startTime >= this.duration){
            this.finished = true;
        }
    }
}