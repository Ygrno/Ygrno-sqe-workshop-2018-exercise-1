/* eslint-disable complexity */
import $ from 'jquery';
import {parseCode_line} from './code-analyzer';


// function Node(exp) {
//     this.line = exp['loc']['start']['line'];
//     if (exp['type'].toString() === 'FunctionDeclaration'){
//         this.type = 'function declaration';
//         this.name = exp['id']['name'];
//         this.condition = null;
//         this.value = null;
//     }
//     else if(exp['type'].toString() === 'Identifier'){
//         this.type = 'variable declaration';
//         this.name = exp['name'];
//         this.condition = null;
//         this.value = null;
//     }
//     else if(exp['type'].toString() === 'VariableDeclarator' || exp['type'].toString() === 'VariableDeclaration'){
//         this.type = 'variable declaration';
//         this.name = exp['declarations']['id']['name'];
//         this.condition = null;
//         this.value = exp['init'];
//     }
//     else if(exp['type'].toString() === 'AssignmentExpression'){
//         this.type = 'assignment expression';
//         this.name = exp['left']['name'];
//         this.condition = null;
//         this.value = exp['right'];
//     }
//     else if(exp['type'].toString() === 'WhileStatement'){
//         this.type = 'while statement';
//         this.name = null;
//         this.condition = exp['test'];
//         this.value = null;
//     }
//     else if(exp['type'].toString() === 'IfStatement'){
//         this.type = 'if statement';
//         this.name = null;
//         this.condition = exp['test'];
//         this.value = null;
//     }
//     else if(exp['type'].toString() === 'ElseStatement'){
//         this.type = 'else if statement';
//         this.name = null;
//         this.condition = exp['test'];
//         this.value = null;
//     }
//     else if(exp['type'].toString() === 'ReturnStatement'){
//         this.type = 'return statement';
//         this.name = null;
//         this.condition = null;
//         this.value = exp['argument'];
//     }
// }



// function Insert(program){
//     let arr =[];
//     let count = 0;
//     for(var key1 in program){
//         for(var key2 in program[key1][0]){
//             if(key2.toString() === 'loc') count++;
//         }
//         if(count > 0){
//             var node = new Node(program[key1][0]);
//             arr.push(node);
//             count = 0;
//         }
//     }
//     return arr;
// }

function Part(line, type, name,condition, value){
    this.line = line;
    this.type = type;
    this.name = name;
    this.condition = condition;
    this.value = value;
}

function FuncDec_parser(codeToExtract,arr){
    arr.push(new Part(codeToExtract['loc']['start']['line'], 'function declaration', codeToExtract['id']['name']));
    if(codeToExtract['params'].length > 0) {for(let i=0;i<codeToExtract['params'].length;i++){Builder(codeToExtract['params'][i],arr);}}
    let func_body = codeToExtract['body']['body'];
    for(let i = 0;i<func_body.length;i++){Builder(func_body[i],arr);}
}

function Identifier_parser(codeToExtract,arr){
    arr.push(new Part(codeToExtract['loc']['start']['line'], 'variable declaration', codeToExtract['name']));
}

function VarDec_parser(codeToExtract,arr){
    let declarations = codeToExtract['declarations'];
    for(let i=0; i<declarations.length;i++){Builder(declarations[i],arr);}
}

function VarDeclarator_parser(codeToExtract,arr){
    arr.push(new Part(codeToExtract['loc']['start']['line'], 'variable declaration', codeToExtract['id']['name'],undefined, Exp_toString(codeToExtract['init'])));
}

/**
 * @return {string}
 */
function variableDec_toString(exp){
    let dec = exp['declarations'];
    let str = '';
    let i;
    for(i=0;i<dec.length - 1;i++) str += Exp_toString(dec[i]) + ',';
    str += Exp_toString(dec[i]);
    return str;
}

/**
 * @return {string}
 */
function Exp_toString(expression){
    if(expression === null) return 'null';
    let exp_type = expression['type'];
    let str = '';
    switch (exp_type) {case 'Literal': str = expression['value']; break; case 'BinaryExpression':{str = Exp_toString(expression['left']) +' ' + expression['operator'] + ' ' + Exp_toString(expression['right']);} break;
    case 'Identifier': str = expression['name']; break; case 'MemberExpression':{str = expression['object']['name'] + '[' + expression['property']['name'] + ']'; break;}
    case 'UnaryExpression': str = expression['operator'] + Exp_toString(expression['argument']); break;
    case 'UpdateExpression': str = Exp_toString(expression['argument']) + expression['operator'] + ' '; break;
    case 'VariableDeclaration': str = variableDec_toString(expression); break;
    case 'VariableDeclarator': str = ' ' + expression['id']['name'] + ' = ' + Exp_toString(expression['init']); break;}
    return str;
}


function ExpAE_parser(codeToExtract,arr){
    arr.push(new Part(codeToExtract['loc']['start']['line'], 'assignment expression', codeToExtract['left']['name'],undefined, Exp_toString(codeToExtract['right'])));
}

function ExpState_parser(codeToExtract,arr){
    let expression = codeToExtract['expression'];
    let exp_type = expression['type'];
    switch (exp_type) {case 'AssignmentExpression': ExpAE_parser(expression,arr); break;}

}

function WhileState_parser(codeToExtract,arr){
    let condition = Exp_toString(codeToExtract['test']);
    arr.push(new Part(codeToExtract['loc']['start']['line'], 'while statement', undefined,condition,undefined));
    let while_body = codeToExtract['body']['body'];
    for(let i = 0; i<while_body.length;  i++) Builder(while_body[i],arr);
}

function IfState_parser(codeToExtract,arr,alternate){
    let condition = Exp_toString(codeToExtract['test']);
    if(alternate === 0) arr.push(new Part(codeToExtract['loc']['start']['line'], 'if statement', undefined,condition,undefined));
    else arr.push(new Part(codeToExtract['loc']['start']['line'], 'else if statement', undefined,condition,undefined));
    Builder(codeToExtract['consequent'],arr);
    if(codeToExtract['alternate'] != null) Builder(codeToExtract['alternate'],arr,1);
    else Builder(codeToExtract['alternate'],arr,0);
}

function ReturnState_parser(codeToExtract,arr){
    let value = Exp_toString(codeToExtract['argument']);
    arr.push(new Part(codeToExtract['loc']['start']['line'], 'return statement', undefined,undefined,value));
}

function ForState_parser(codeToExtract,arr){
    let init = Exp_toString(codeToExtract['init']);
    let test = Exp_toString(codeToExtract['test']);
    let update = Exp_toString(codeToExtract['update']);
    arr.push(new Part(codeToExtract['loc']['start']['line'], 'for statement', undefined,init + ' ; ' + test + ' ; ' + update,undefined));
    let for_body = codeToExtract['body']['body'];
    for(let i = 0; i<for_body.length;  i++) Builder(for_body[i],arr);
}

function Builder(codeToExtract,arr,alternate){
    let type = codeToExtract['type'];
    switch (type) {case 'FunctionDeclaration': FuncDec_parser(codeToExtract,arr); break; case 'Identifier':Identifier_parser(codeToExtract,arr);break;
    case 'VariableDeclaration': VarDec_parser(codeToExtract,arr); break; case 'VariableDeclarator':VarDeclarator_parser(codeToExtract,arr); break;
    case 'ExpressionStatement': ExpState_parser(codeToExtract,arr); break;
    case 'WhileStatement': WhileState_parser(codeToExtract,arr); break;
    case 'IfStatement': {if(alternate === 1) IfState_parser(codeToExtract,arr,1); else IfState_parser(codeToExtract,arr,0);} break;
    case 'ReturnStatement': ReturnState_parser(codeToExtract,arr); break;
    case 'ForStatement': ForState_parser(codeToExtract,arr); break;}
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
        for(var key in myArray[i]){
            if(myArray[i].hasOwnProperty(key)) {
                if (myArray[i][key] === null || myArray[i][key] === undefined) result += '<td align="center">' + '</td>';
                else result += '<td align="center">' + (myArray[i][key]).toString() + '</td>';
            }
        }
        result += '</tr>';
    }
    result += '</table>'; return result;
}

// $(document).ready(function () {
//     $('#codeSubmissionButton').click(() => {
//         let codeToParse = $('#codePlaceholder').val();
//         let parsedCode = parseCode(codeToParse);
//         $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
//     });
// });


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let arr = [];
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0],arr);
        document.write(makeTableHTML(arr));
    });
});

