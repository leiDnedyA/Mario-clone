
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
    constructor(position = [0, 0], callback, range = [5, 5], isRepeatable = true, repeatDelay = 5000) {
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
    tryExecution(playerPosition) {
        if ((this.isRepeatable && Date.now() - this.lastExecution >= this.repeatDelay) || (!this.isRepeatable && !this.hasExecuted)) {
            let xPosCheck = playerPosition[0] >= this.position[0] - this.range[0] && playerPosition[0] <= this.position[0] + this.range[0];
            let yPosCheck = playerPosition[1] >= this.position[1] - this.range[1] && playerPosition[1] <= this.position[1] + this.range[1];
            if (xPosCheck && yPosCheck) {
                this.execute(playerPosition);
            }
        }
    }

    /**
     * Executes callback function for event.
     * 
     * @param {[x, y]} playerPosition current position of player
     */
    execute(playerPosition) {
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
