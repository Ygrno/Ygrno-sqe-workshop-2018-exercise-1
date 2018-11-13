import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const parseCode_line = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc: true});
};

export {parseCode, parseCode_line};


