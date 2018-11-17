import * as esprima from 'esprima';

function TableLine(line, type, name,condition, value){
    this.line = line;
    this.type = type;
    this.name = name;
    this.condition = condition;
    this.value = value;
}

function FuncDec_P(codeToExtract,arr){
    arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'function declaration', codeToExtract['id']['name']));
    if(codeToExtract['params'].length > 0) {for(let i=0;i<codeToExtract['params'].length;i++){Builder(codeToExtract['params'][i],arr,4);}}
    let func_body = codeToExtract['body']['body'];
    for(let i = 0;i<func_body.length;i++){if(func_body[i]['type'].toString() === 'IfStatement') Builder(func_body[i],arr,0); else Builder(func_body[i],arr,4);}
}

function Identifier_P(codeToExtract,arr){
    arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'variable declaration', codeToExtract['name']));
}

function VarDec_P(codeToExtract,arr){
    let declarations = codeToExtract['declarations'];
    for(let i=0; i<declarations.length;i++){Builder(declarations[i],arr,4);}
}

function VarDeclarator_P(codeToExtract,arr){
    arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'variable declaration', codeToExtract['id']['name'],undefined, Exp_toString(codeToExtract['init'])));
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
    arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'assignment expression', codeToExtract['left']['name'],undefined, Exp_toString(codeToExtract['right'])));
}

function ExpState_P(codeToExtract,arr){
    let expression = codeToExtract['expression'];
    let exp_type = expression['type'];
    switch (exp_type) {case 'AssignmentExpression': ExpAE_parser(expression,arr); break;}

}

function WhileState_P(codeToExtract,arr){
    let condition = Exp_toString(codeToExtract['test']);
    arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'while statement', undefined,condition,undefined));
    let while_body = codeToExtract['body']['body'];
    for(let i = 0; i<while_body.length;  i++) Builder(while_body[i],arr,4);
}

function IfState_P(codeToExtract,arr,alternate){
    let condition = Exp_toString(codeToExtract['test']);
    if(alternate === 0) arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'if statement', undefined,condition,undefined));
    else arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'else if statement', undefined,condition,undefined));
    Builder(codeToExtract['consequent'],arr,4);
    if(codeToExtract['alternate'] != null) Builder(codeToExtract['alternate'],arr,1);
}

function ReturnState_P(codeToExtract,arr){
    let value = Exp_toString(codeToExtract['argument']);
    arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'return statement', undefined,undefined,value));
}

function ForState_P(codeToExtract,arr){
    let init = Exp_toString(codeToExtract['init']);
    let test = Exp_toString(codeToExtract['test']);
    let update = Exp_toString(codeToExtract['update']);
    arr.push(new TableLine(codeToExtract['loc']['start']['line'], 'for statement', undefined,init + ' ; ' + test + ' ; ' + update,undefined));
    let for_body = codeToExtract['body']['body'];
    for(let i = 0; i<for_body.length;  i++) Builder(for_body[i],arr,4);
}

const Functions_parser = {
    FunctionDeclaration: FuncDec_P,
    VariableDeclaration: VarDec_P,
    ExpressionStatement: ExpState_P,
    WhileStatement: WhileState_P,
    IfStatement:IfState_P,
    ReturnStatement: ReturnState_P,
    ForStatement: ForState_P,
    Identifier: Identifier_P,
    VariableDeclarator: VarDeclarator_P};

/**
 * @return {string}
 */
function Builder(codeToExtract,arr,alternate) {
    let exp_type = codeToExtract['type'];
    if((alternate === 5) && (exp_type.toString() !== 'FunctionDeclaration')) return 'Error - Not Function';
    if(exp_type.toString() !== 'IfStatement') Functions_parser[exp_type](codeToExtract,arr,4);
    else if(alternate === 1) IfState_P(codeToExtract,arr,1); else IfState_P(codeToExtract,arr,0);
}

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const parseCode_line = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc: true});
};

export {parseCode, parseCode_line, Builder,Exp_toString};


