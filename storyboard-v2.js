/// Max White
/// LTEC 2018-2019 Fraction Comic Storyboards analysis

/// External requirements
require('../sb3-analysis/sb3-structure');
let arrayToCSV = require('../csv-gen/array-to-csv');
let fs = require('fs');

/// Object class that holds the info we need for each scene
class Scene {
    constructor() {
        this.opcodes = [];
        this.duration = 0;
        this.isEnd = false;
    }
}

/// Array that will hold arrays, each corresponding to a row of the table
let table = [];

/// First row of the table, which contains headers for each column
let header = [
    'Project ID',
    'Abby scenes', 'Devin scenes', 'A. Card scenes', 'D. Card scenes', 'Max difference',
    'Scene 1 sprites', 'Scene 2 sprites', 'Scene 3 sprites', 'Scene 4 sprites', 'Sync. count'
];
table.push(header);

/// Analysis of files in the projects folder
let fileNames = fs.readdirSync('./projects/');
for (let fileName of fileNames) {
    var file = fs.readFileSync('./projects/' + fileName, 'utf8');
    var project = new Project(JSON.parse(file));
    let row = [];
    row.push(fileName);
    let scenesList = [];
    var sprites = [null, null, null, null];
    for (let sprite of project.sprites) {
        if (sprite.name === 'Abby' || sprite.name === 'Avarey') {
            sprites[0] = sprite;
        }
        if (sprite.name === 'Devin' || sprite.name === 'Eli') {
            sprites[1] = sprite;
        }
        if (sprite.name === "Abby's Card") {
            sprites[2] = sprite;
        }
        if (sprite.name === "Devin's Card") {
            sprites[3] = sprite;
        }
    }

    /// Number of scenes implemented for each sprite
    for (let sprite of sprites) {
        if (!sprite) {
            row.push(0);
        }
        else {
            let scenesCandidates = [];
            for (let script of sprite.validScripts.filter(script => script.blocks[0].opcode === 'event_whenflagclicked')) {
                let scenes = [];
                let scene = new Scene();
                for (let block of script.blocks) {
                    scene.opcodes.push(block.opcode);
                    scene.duration += block.duration;
                    if ((scene.duration || !block.next) && block.opcode !== 'procedures_call') {
                        if (!block.next) {
                            scene.isEnd = true;
                        }
                        scenes.push(scene);
                        scene = new Scene();
                    }
                }
                scenesCandidates.push(scenes);
            }
            let selectedScenes = [];
            let maxScenes = -1;
            for (let scenesCandidate of scenesCandidates) {
                if (scenesCandidate.length > maxScenes) {
                    selectedScenes = scenesCandidate;
                    maxScenes = selectedScenes.length;
                }
            }
            scenesList.push(selectedScenes);
            row.push(selectedScenes.length);
        }
    }

    /// Maximum difference in number of scenes implemented
    let maxDiff = -1;
    for (let i = 1; i < 5; i++) {
        for (let j = 1; j < 5; j++) {
            diff = Math.abs(row[i] - row[j]);
            if (diff > maxDiff) {
                maxDiff = diff;
            }
        }
    }
    row.push(maxDiff);

    /// Number of sprites that implement each scene
    let rowSlice = row.slice(1, 5);
    scene1Sprites = rowSlice.filter(cell => cell !== '' && cell >= 1).length;
    scene2Sprites = rowSlice.filter(cell => cell !== '' && cell >= 2).length;
    scene3Sprites = rowSlice.filter(cell => cell !== '' && cell >= 3).length;
    scene4Sprites = rowSlice.filter(cell => cell !== '' && cell >= 4).length;
    row.push(scene1Sprites);
    row.push(scene2Sprites);
    row.push(scene3Sprites);
    row.push(scene4Sprites);

    /// Number of synchronizations that exist between scenes
    let syncScore = 0;
    for (let scenes of scenesList) {
        for (let otherScenes of scenesList.filter(otherScenes => otherScenes !== scenes)) {
            for (let i = 0; i < scenes.length; i++) {
                if (otherScenes[i] && (scenes[i].duration === otherScenes[i].duration || (scenes[i].isEnd && otherScenes[i].isEnd))) {
                    syncScore++;
                }
                else {
                    break;
                }
            }
        }
    }
    syncScore /= 2;
    row.push(syncScore);

    /// Adding the row to the table
    table.push(row);
}

/// Saving the table in the results folder
arrayToCSV(table, './results/storyboard-v2.csv');
