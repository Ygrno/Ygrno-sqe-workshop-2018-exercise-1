import assert from 'assert';
import {parseCode, parseCode_line, Builder, Exp_toString} from '../src/js/code-analyzer';


function Test1() {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode_line(''),null,4), '{\n' + '    "type": "Program",\n' + '    "body": [],\n' + '    "sourceType": "script",\n' + '    "loc": {\n' +
            '        "start": {\n' +
            '            "line": 0,\n' +
            '            "column": 0\n' +
            '        },\n' +
            '        "end": {\n' +
            '            "line": 0,\n' +
            '            "column": 0\n' +
            '        }\n' +
            '    }\n' +
            '}'
        );
    });
}

function Test2() {
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
}

function Test3() {
    it('is parsing the given example correctly', () => {
        let arr = [];
        let codeToParse = 'function binarySearch(X, V, n){\n' + '    let low, high, mid;\n' + '    low = 0;\n' + '    high = n - 1;\n' + '    while (low <= high) {\n' + '        mid = (low + high)/2;\n' + '        if (X < V[mid])\n' + '            high = mid - 1;\n' + '        else if (X > V[mid])\n' + '            low = mid + 1;\n' + '        else\n' + '            return mid;\n' + '    }\n' + '    return -1;\n' + '}';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"binarySearch"},{"line":1,"type":"variable declaration","name":"X"},' + '{"line":1,"type":"variable declaration","name":"V"},{"line":1,"type":"variable declaration","name":"n"},{"line":2,"type":"variable declaration",' +
            '"name":"low","value":"null"},{"line":2,"type":"variable declaration","name":"high",' +
            '"value":"null"},{"line":2,"type":"variable declaration","name":"mid","value":"null"},' +
            '{"line":3,"type":"assignment expression","name":"low","value":0},{"line":4,' +
            '"type":"assignment expression","name":"high","value":"n - 1"},' + '{"line":5,"type":"while statement","condition":"low <= high"},' +
            '{"line":6,"type":"assignment expression","name":"mid","value":"low + high / 2"},' + '{"line":7,"type":"if statement","condition":"X < V[mid]"},{"line":8,"type":"assignment expression",' +
            '"name":"high","value":"mid - 1"},{"line":9,"type":"else if statement","condition":"X > V[mid]"},' +
            '{"line":10,"type":"assignment expression","name":"low","value":"mid + 1"},{"line":12,"type":"return statement","value":"mid"},' + '{"line":14,"type":"return statement","value":"-1"}]');
    });
}

function Test4() {
    it('is parsing a simple example correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { let a = 5; }';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"variable declaration","name":"a","value":5}]');
    });
}



function Test5() {
    it('isn\'t parsing a code that doesn\'t start with a function', () => {
        let arr = [];
        let codeToParse = 'let a = 5;';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[]');
    });
}

function Test6() {
    it('is parsing for-loop correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { for(var i = 0; i<=3 ; i++) {let a = 6;} }';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"for statement","condition":" i = 0 ; i <= 3 ; i++ "},{"line":1,"type":"variable declaration","name":"a","value":6}]');
    });
}

function Test7() {
    it('is parsing while-loop correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { while(a>5) {let a = 6;} }';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"while statement","condition":"a > 5"},{"line":1,"type":"variable declaration","name":"a","value":6}]');
    });
}

function Test8() {
    it('is parsing If-Statement correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { if(a > 7) x=3; else if(a < 3) x=6; else x=7;}';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"if statement","condition":"a > 7"},{"line":1,"type":"assignment expression","name":"x","value":3},{"line":1,"type":"else if statement","condition":"a < 3"},{"line":1,"type":"assignment expression","name":"x","value":6},{"line":1,"type":"assignment expression","name":"x","value":7}]');
    });
}

function Test9() {
    it('is converting Binary-Expression to string correctly', () => {
        let codeToParse = 'n+1';
        let parsedCode = parseCode_line(codeToParse);
        let str = Exp_toString(parsedCode['body'][0]['expression']);
        assert.equal(str,'n + 1');
    });
}

function Test10() {
    it('is converting Binary-Expression2 to string correctly', () => {
        let codeToParse = 'n+m';
        let parsedCode = parseCode_line(codeToParse);
        let str = Exp_toString(parsedCode['body'][0]['expression']);
        assert.equal(str,'n + m');
    });
}



describe('The javascript parser', () => {
    Test1();
    Test2();
});

describe('Html table parser', ()=> {
    Test3();
    Test4();
    Test5();
    Test6();
    Test7();
    Test8();
});

describe('Expression to String', ()=> {
    Test9();
    Test10();
});
