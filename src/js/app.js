import $ from 'jquery';
import {parseCode_line,Builder} from './code-analyzer';

function HTML_row_maker(myArray, i, result) {
    for (var key in myArray[i]) {
        if (myArray[i].hasOwnProperty(key)) {
            if (myArray[i][key] === null || myArray[i][key] === undefined) result += '<td align="center">' + '</td>';
            else result += '<td align="center">' + (myArray[i][key]).toString() + '</td>';
        }
    }
    return result;
}

const table_style = '    <style>\n' +
    '        table, th, td {\n' +
    '            /*border: 1px solid black;*/\n' +
    '            border-collapse: collapse;\n' +
    '        }\n' +
    '\n' +
    '        th, td {\n' +
    '            padding: 12px;\n' +
    '            text-align: center;\n' +
    '        }\n' +
    '\n' +
    '        table#t01 tr:nth-child(even) {\n' +
    '            background-color: #eee;\n' +
    '        }\n' +
    '        table#t01 tr:nth-child(odd) {\n' +
    '            background-color: #fff;\n' +
    '        }\n' +
    '        table#t01 th {\n' +
    '            background-color: black;\n' +
    '            color: white;\n' +
    '        }\n' +
    '\n' +
    '        textarea {\n' +
    '            width: 80%;\n' +
    '            height: 95%;\n' +
    '        }\n' +
    '    </style>';

function makeTableHTML(myArray) {
    let result = table_style;
    result += '<table id="t01" border=1 align="center" style="margin: 0 auto;">';
    result += '<tr>';
    result += '<th>' + 'Line' + '</th>';
    result += '<th>' + 'Type' + '</th>';
    result += '<th>' + 'Name' + '</th>';
    result += '<th>' + 'Condition' + '</th>'; result += '<th>' + 'Value' + '</th>'; result += '</tr>';
    for(var i=0; i<myArray.length; i++) {
        result += '<tr>';
        result = HTML_row_maker(myArray, i, result);
        result += '</tr>';
    }
    result += '</table>'; return result;
}

export{Builder};

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codePlace = $('#codePlaceholder');
        let arr = [];
        let codeToParse = codePlace.val();
        let parsedCode = parseCode_line(codeToParse);
        let str = Builder(parsedCode['body'][0],arr,5);
        if(str !== 'Error - Not Function') document.write(makeTableHTML(arr));
        else codePlace.val(str);
    });
});

// -----------------------------------------------------------------------------------------------------------------------

// $(document).ready(function () {
//     $('#codeSubmissionButton').click(() => {
//         let codeToParse = $('#codePlaceholder').val();
//         let parsedCode = parseCode(codeToParse);
//         $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
//     });
// });

// $(document).ready(function () {
//     $('#codeSubmissionButton').click(() => {
//         let arr = [];
//         let codeToParse = $('#codePlaceholder').val();
//         let parsedCode = parseCode_line(codeToParse);
//         Builder(parsedCode['body'][0],arr);
//         $('#parsedCode').val(JSON.stringify(arr));
//     });
// });

