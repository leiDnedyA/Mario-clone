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
    constructor(entities = [], platforms = [], playerStartPos = [0, 0], boundingBox = [[0, 0], [tilesVisibleVertically * 1.5, tilesVisibleVertically]], backgroundMusic = 'backgroundPiano', positionEvents = [], doors = []) {
        this.entities = entities;
        this.platforms = platforms;
        this.playerStartPos = playerStartPos;
        this.boundingBox = boundingBox;
        this.backgroundMusic = backgroundMusic;
        this.positionEvents = positionEvents;
        this.doors = doors;
    }
}
