
const uploadInput = document.querySelector("#levelUploadInput");
const uploadButton = document.querySelector("#levelLoadButton");
const downloadButton = document.querySelector("#levelDownloadButton");
const newLevelButton = document.querySelector("#newLevelButton")
uploadButton.addEventListener('click', _ => {
    let files = uploadInput.files;
    if (files.length <= 0) {
        return false;
    }

    let fr = new FileReader();

    fr.onload = function (e) {
        levelLoader.loadLevel(e.target.result);
    }

    fr.readAsText(files.item(0));
})
downloadButton.addEventListener('click', _ => {
    levelLoader.exportLevel('level', 'level');
})

newLevelButton.addEventListener('click', _ => { 
    levelLoader.createLevel();
})