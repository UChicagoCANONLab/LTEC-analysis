/// Max White
/// LTEC 2018-2019 Frog & the Fly analysis

/// External requirements
let arrayToCSV = require('../csv-gen/array-to-csv');
let fs = require('fs');
let Papa = require('papaparse');

/// Array that will hold arrays, each corresponding to a row of the table
let table = [];

/// First row of the table, which contains headers for each column
let header = [
    '4 right', '4 wrong; 5 right', '4 wrong; 5 closer', '4 & 5 wrong',
    '8 right', '8 wrong; 9 right', '8 wrong; 9 closer', '8 & 9 wrong',
    'correct answers for 10'
];
table.push(header);

/// Analysis of files in the projects folder
let data = Papa.parse(fs.readFileSync('./sheets/frog.csv', 'utf8'), {header: true}).data;
for (let dataRow of data) {
    let resultsRow = [];
    resultsRow = resultsRow.concat(compareAnswers(dataRow.j4, dataRow.j5));
    resultsRow = resultsRow.concat(compareAnswers(dataRow.j8, dataRow.j9));
    let correct10Answers = 0; /// Number of correct answers to question 10
    if (multiplyFactors(dataRow['10A']) === 360) correct10Answers++;
    if (multiplyFactors(dataRow['10B']) === 360) correct10Answers++;
    if (multiplyFactors(dataRow['10C']) === 360) correct10Answers++;
    if (multiplyFactors(dataRow['10D']) === 360) correct10Answers++;
    resultsRow.push(correct10Answers);
    table.push(resultsRow);
}

/// Saving the table in the results folder
arrayToCSV(table, './results/frog-results.csv');

function multiplyFactors(str) {
    if (str === 'no answer' || str === undefined) {
        return null;
    }
    let answer = 1;
    let factors = str.split(';').slice(0, 2);
    for (let factor of factors) {
        if (isNaN(parseInt(factor))) {
            return null;
        }
        else {
            answer *= parseInt(factor);
        }
    }
    return answer;
}

/// Compares a pair of answers to see if the student improved their estimate.
function compareAnswers(answer1, answer2) {
    let value1 = multiplyFactors(answer1);
    let value2 = multiplyFactors(answer2);
    if (value1 === 360) {
        return [1, 0, 0, 0]; /// [4 right, 4 wrong but 5 right, 4 wrong but 5 closer, 4 wrong but no improvement]
    }
    else if (value1 !== 360 && value2 === 360) {
        return [0, 1, 0, 0];
    }
    else if ((Math.abs(360 - value2) < Math.abs(360 - value1)) || (value2 !== null && value1 === null)) {
        return [0, 0, 1, 0];
    }
    else {
        return [0, 0, 0, 1];
    }
}
