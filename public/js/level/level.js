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

/**
 * Loads a level from a JSON file.
 * 
 * @async
 * @param {string} levelSRC link to level JSON
 * @returns {Promise<Level>} instance of Level class
 */
function loadLevelJSON(levelSRC) {
    return new Promise(resolve => {
        fetch(levelSRC)
            .then(response => {
                resolve(response.json());
            })
    })
}

/**
 * Loads list of levels from JSON files.
 * 
 * @async
 * @param {[string]} levelSRCList list of links to level JSON files
 * @param {[]} dumpList list to dump Level data into
 */
async function loadLevelJSONList(levelSRCList, dumpList) {
    for (let i in levelSRCList) {
        let rawLevel = await loadLevelJSON(levelSRCList[i]);
        let l = parseRawLevel(rawLevel);
        dumpList.push(l);
    }
}

/**
 * Generates instance of Level class based on a level object from a JSON file.
 * 
 * @param {object} rawLevel level object directly from JSON file
 * @returns {Level} level instance generated
 */
function parseRawLevel(rawLevel){
    let entities = [];
    let platforms = [];
    let doors = [];
    let positionEvents = [];

    console.log(rawLevel);

    for(let i in rawLevel.entities){
        //come back when entities are a thing and implement this.
    }

    for(let i in rawLevel.platforms){
        let p = rawLevel.platforms[i];
        platforms.push(new Platform(p.position, p.dimensions));        
    }

    for(let i in rawLevel.doors){
        let d = rawLevel.doors[i];
        doors.push(new Door(d.position, d.dimensions, d.destinationLevelIndex, d.exitPosition));
    }

    for(let i in rawLevel.positionEvents){
        //come back when positionEvents are implemented into level storage
    }

    return new Level(entities, platforms, rawLevel.playerStartPos, rawLevel.boundingBox, rawLevel.backgroundMusic, positionEvents, doors)
}

//tests

// let levelList = [];

// loadLevelJSONList(['./levels/level0.json', './levels/level1.json'], levelList).then(_ => { console.log(levelList) });
