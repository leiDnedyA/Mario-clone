
class Door {
    constructor(position = [0, 0], dimensions = [1, 1], destinationLevelIndex = 0, exitPosition = [10, 10]) {
        this.position = position;
        this.dimensions = dimensions;
        this.destinationLevelIndex = destinationLevelIndex;
        this.exitPosition = exitPosition;
    }
}
