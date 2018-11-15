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

function makeTableHTML(myArray) {
    var result = '<table border=1 align="center" style="margin: 0 auto;">';
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

