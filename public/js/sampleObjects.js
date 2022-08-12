
let sampleLevelPlatforms = [];

sampleLevelPlatforms.push(new Platform([10, 11], [25, 1]));
sampleLevelPlatforms.push(new Platform([15, 6], [25, 1]));
sampleLevelPlatforms.push(new Platform([20, 3], [25, 1]));
sampleLevelPlatforms.push(new Platform([40, 15], [4, 1]));
sampleLevelPlatforms.push(new Platform([15, 25], [4, 1]));
sampleLevelPlatforms.push(new Platform([15, 6], [25, 1]));
sampleLevelPlatforms.push(new Platform([30, 30], [25, 1]));

let samplePosEvent = new PositionEvent([40, 25], (playerPosition) => { textManager.createText('Use "A", "D", and Space to move', [...playerPosition]) }, [5, 5], true, 1000);
let samplePosEvent2 = new PositionEvent([32, -3], (playerPosition) => { textManager.createText('Press "W" to enter the door!', [...playerPosition]) }, [10, 6], true, 1000);
let samplePosEvent3 = new PositionEvent([18, 14], (playerPosition) => { textManager.createText('Ty for testing my game <3', [...playerPosition]) }, [10, 6], true, 1000);
let samplePosEvent4 = new PositionEvent([70, 30], (playerPosition) => { textManager.createText('Woah good job :O', [...playerPosition]) }, [5, 5], true, 1000);
let samplePosEvent5 = new PositionEvent([80, 39], (playerPosition) => { textManager.createText('jk >:D', [...playerPosition]) }, [20, 6], true, 1000);

let sampleDoor = new Door([34, 1], [1, 2], 1, [18, 10]);
let sampleDoor2 = new Door([16, 13], [1, 2], 0, [34, -1]);

function generateLevels(tilesVisibleVertically){


    let sampleLevel0 = new Level([], sampleLevelPlatforms, [40, 25], [[-10, -10], [2 * tilesVisibleVertically + 20, tilesVisibleVertically + 100]], 'backgroundPiano', [samplePosEvent, samplePosEvent2], [sampleDoor]);
    let sampleLevel1 = new Level([], [new Platform([15, 15], [10, 1]), new Platform([70, 30], [3, 1])], [18, 12], [[-10, -10], [2 * tilesVisibleVertically + 20, tilesVisibleVertically + 100]], 'backgroundPiano', [samplePosEvent3, samplePosEvent4, samplePosEvent5], [sampleDoor2]);

    return {0: sampleLevel0, 1: sampleLevel1};

}
