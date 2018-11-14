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
function Literal_toString(str, expression) {
    str = expression['value'];
    return str;
}

/**
 * @return {string}
 */
function BE_toString(str, expression) {
    str = Exp_toString(expression['left']) + ' ' + expression['operator'] + ' ' + Exp_toString(expression['right']);
    return str;
}
/**
 * @return {string}
 */
function Identifier_toString(str, expression) {
    str = expression['name'];
    return str;
}
/**
 * @return {string}
 */
function ME_toString(str, expression) {
    str = expression['object']['name'] + '[' + expression['property']['name'] + ']';
    return str;
}
/**
 * @return {string}
 */
function UA_toString(str, expression) {
    str = expression['operator'] + Exp_toString(expression['argument']);
    return str;
}
/**
 * @return {string}
 */
function UE_toString(str, expression) {
    str = Exp_toString(expression['argument']) + expression['operator'] + ' ';
    return str;
}
/**
 * @return {string}
 */
function VD1_toString(str, expression) {
    str = variableDec_toString(expression);
    return str;
}
/**
 * @return {string}
 */
function VD2_toString(str, expression) {
    str = ' ' + expression['id']['name'] + ' = ' + Exp_toString(expression['init']);
    return str;
}

const FUNCTIONS_toString = {
    Literal: Literal_toString,
    BinaryExpression: BE_toString,
    Identifier: Identifier_toString,
    MemberExpression: ME_toString,
    UnaryExpression: UA_toString,
    UpdateExpression: UE_toString,
    VariableDeclaration: VD1_toString,
    VariableDeclarator: VD2_toString
};

/**
 * @return {string}
 */
function Exp_toString(expression){
    if(expression === null) return 'null';
    let exp_type = expression['type'];
    return FUNCTIONS_toString[exp_type]('', expression);
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

const Functions_parser = {
    FunctionDeclaration: FuncDec_parser,
    VariableDeclaration: VarDec_parser,
    ExpressionStatement: ExpState_parser,
    WhileStatement: WhileState_parser,
    IfStatement:IfState_parser,
    ReturnStatement: ReturnState_parser,
    ForStatement: ForState_parser,
    Identifier: Identifier_parser,
    VariableDeclarator: VarDeclarator_parser};

function Builder(codeToExtract,arr,alternate) {
    let type = codeToExtract['type'];
    if(type.toString() !== 'IfStatement') Functions_parser[type](codeToExtract,arr,alternate);
    else if(alternate === 1) IfState_parser(codeToExtract,arr,1); else IfState_parser(codeToExtract,arr,0);
}


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

