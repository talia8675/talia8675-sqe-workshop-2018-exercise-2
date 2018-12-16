import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

export {parseCode,itercode};
const parseCode = (codeToParse) => {//get string of code, ret jason
    return esprima.parseScript(codeToParse);
};

function rowInDictionary(name, value) {
    return  {
        Name: name,
        Value: value
    };
}
function lineInCode(line, color) {
    return  {
        Line: line,
        Color: color //red, green, black
    };
}
function input(name, value) {
    return  {
        Name: name,
        Value: value
    };
}

function itercode(codeJason, inputsJason) {
    let inputs = [], dictionary = [],symbolicSubstitution = [],global = [];
    let end = 0, modify =false, i=0;
    while(i < codeJason.body.length && !modify){
        if(codeJason.body[i].type !='FunctionDeclaration') {
            handleByType(symbolicSubstitution, codeJason.body[i], global, inputs, inputsJason);
            if(i==(codeJason.body.length -1))
                end = i+1;
        }
        else {
            modify=true;
            end=i;
        }
        i++;
    }
    insertGlobalToDictionary(dictionary,global);
    return loopItercode(symbolicSubstitution, dictionary, codeJason, inputs,inputsJason, end);
}

function insertGlobalToDictionary(dictionary,global) {
    for (let j = 0; j < global.length; j++) {
        dictionary.push(rowInDictionary(global[j].Name, global[j].Value));
    }
}

function loopItercode (symbolicSubstitution, dictionary, codeJason, inputs,inputsJason, end) {
    for (let i = end; i < codeJason.body.length; i++)
        handleByType(symbolicSubstitution, codeJason.body[i],dictionary, inputs,inputsJason);
    return symbolicSubstitution;
}

const funcByType ={
    'FunctionDeclaration': functionDeclaration,
    'VariableDeclaration' : variableDeclaration,
    'ExpressionStatement' : expressionStatement,
    'ReturnStatement' : returnStatement,
    'WhileStatement' : whileStatement,
    'IfStatement' : ifStatement
};

function handleByType(symbolicSubstitution, codeJasonBody, dictionary, inputs,inputsJason) {
    return funcByType[codeJasonBody.type](symbolicSubstitution, codeJasonBody, dictionary, inputs,inputsJason);
}

function functionDeclaration(symbolicSubstitution, codeJasonBody, dictionary, inputs,inputsJason) {
    addInputs(inputs,inputsJason, codeJasonBody);
    let params = '(';
    if (codeJasonBody.params.length > 0) {
        params = params + codeJasonBody.params[0].name;
        removeGlobal(dictionary, codeJasonBody.params[0].name);
    }
    for (let i=1 ; i<codeJasonBody.params.length; i++){
        params = params + ', ' + codeJasonBody.params[i].name;
        removeGlobal(dictionary, codeJasonBody.params[i].name);
        //symbolicSubstitution.push(lineInCode('-------cell rmover: ' + dictionary[indexVar(dictionary,codeJasonBody.params[i].name)],''));
    }
    params = params+ ')';

    symbolicSubstitution.push(lineInCode( 'function ' + codeJasonBody.id.name + params + '{' ,'black'));
    loopItercode(symbolicSubstitution, dictionary, codeJasonBody.body, inputs,inputsJason, 0);
    symbolicSubstitution.push(lineInCode( '}','black'));
}

function addInputs(inputs,inputsJason, codeJasonBody){
    if(inputsJason.body.length>0) {
        if(inputsJason.body[0].expression.type==='SequenceExpression') {
            let values = inputsJason.body[0].expression.expressions;
            for (let i = 0; i < codeJasonBody.params.length; i++)
                inputs.push(input(codeJasonBody.params[i].name, escodegen.generate(values[i])));
        }
        else inputs.push(input(codeJasonBody.params[0].name, escodegen.generate(inputsJason.body[0].expression)));
    }
}

function removeGlobal(dictionary, param) {
    if(isVarInDictionary(dictionary, param))
        delete dictionary[indexVar(dictionary,param)];
}

function variableDeclaration(symbolicSubstitution, codeJasonBody, dictionary, inputs) {
    for (let i = 0; i < codeJasonBody.declarations.length; i++) {
        let variable = codeJasonBody.declarations[i];
        if(!isVarInDictionary(dictionary, variable.id.name))
            dictionary.push(rowInDictionary(variable.id.name, ''));
        if(variable.init!=null)
            dictionary[indexVar(dictionary,variable.id.name)].Value = substitutionValue(dictionary, variable.init, inputs,symbolicSubstitution);
    }
}

function expressionStatement(symbolicSubstitution, codeJasonBody, dictionary, inputs){
    let exp = codeJasonBody.expression;
    if(isVarInDictionary(dictionary, exp.left.name))
        dictionary[indexVar(dictionary,exp.left.name)].Value = substitutionValue(dictionary, exp.right, inputs,symbolicSubstitution);
    else  {
        symbolicSubstitution.push(lineInCode(exp.left.name + ' = ' + substitutionValue(dictionary, exp.right, inputs,symbolicSubstitution)+';', 'black'));
        inputs[indexVar(inputs, exp.left.name)].Value = substitutionValue(dictionary, exp.right, inputs,symbolicSubstitution);
    }
}

function returnStatement(symbolicSubstitution, codeJasonBody, dictionary, inputs) {
    symbolicSubstitution.push(lineInCode('return ' +  substitutionValue(dictionary, codeJasonBody.argument, inputs,symbolicSubstitution) +';','black'));
}

function whileStatement(symbolicSubstitution, codeJasonBody, dictionary, inputs,inputsJason) {
    symbolicSubstitution.push(lineInCode('while (' + substitutionValue(dictionary, codeJasonBody.test, inputs,symbolicSubstitution) + '){','black'));
    loopItercode(symbolicSubstitution, dictionary, codeJasonBody.body, inputs,inputsJason, 0);
    symbolicSubstitution.push(lineInCode( '}','black'));
}

function ifStatement(symbolicSubstitution, codeJasonBody, dictionary, inputs) {
    let d = copyDictionary(dictionary);
    if(codeJasonBody.consequent.type === 'BlockStatement')
        typeBS(symbolicSubstitution, codeJasonBody, dictionary, inputs ,'if');
    else notBS(symbolicSubstitution, codeJasonBody, dictionary, inputs,'if');

    if (codeJasonBody.alternate != null && codeJasonBody.alternate.type === 'IfStatement')
        elseifStatement(symbolicSubstitution, codeJasonBody.alternate,d,  inputs);
    else if(codeJasonBody.alternate != null)
        elseStatement(symbolicSubstitution, d,codeJasonBody.alternate, inputs);
}

function elseifStatement(symbolicSubstitution, codeJasonBody, dictionary, inputs) {
    let d = copyDictionary(dictionary);
    if(codeJasonBody.consequent.type === 'BlockStatement')
        typeBS(symbolicSubstitution, codeJasonBody, dictionary, inputs, 'else if');
    else notBS(symbolicSubstitution, codeJasonBody, dictionary, inputs, 'else if');

    if (codeJasonBody.alternate != null && codeJasonBody.alternate.type === 'IfStatement')
        elseifStatement(symbolicSubstitution, codeJasonBody.alternate,d,  inputs);
    else if(codeJasonBody.alternate != null)
        elseStatement(symbolicSubstitution, d,codeJasonBody.alternate, inputs);
}

function typeBS(symbolicSubstitution, codeJasonBody, dictionary, inputs, type,inputsJason){
    if (isGreen( dictionary, codeJasonBody.test, inputs) )
        symbolicSubstitution.push(lineInCode(type+ ' (' + substitutionValue(dictionary, codeJasonBody.test, inputs,symbolicSubstitution) + '){', 'green'));
    else symbolicSubstitution.push(lineInCode(type+' (' + substitutionValue(dictionary, codeJasonBody.test, inputs,symbolicSubstitution) + '){', 'red'));
    loopItercode(symbolicSubstitution, dictionary ,codeJasonBody.consequent, inputs,inputsJason, 0);
    symbolicSubstitution.push(lineInCode( '}','black'));
}

function notBS(symbolicSubstitution, codeJasonBody, dictionary, inputs, type,inputsJason){
    if (isGreen( dictionary,codeJasonBody.test, inputs) )
        symbolicSubstitution.push(lineInCode(type+ ' (' + substitutionValue(dictionary, codeJasonBody.test, inputs,symbolicSubstitution) + ')','green'));
    else symbolicSubstitution.push(lineInCode(type+ ' ('+ substitutionValue(dictionary, codeJasonBody.test, inputs,symbolicSubstitution) + ')','red'));
    funcByType[codeJasonBody.consequent.type](symbolicSubstitution, codeJasonBody.consequent, dictionary,inputs,inputsJason);
}

function elseStatement(symbolicSubstitution, dictionary, alt, inputs,inputsJason){
    if (alt.type === 'BlockStatement') {
        symbolicSubstitution.push(lineInCode('else {','black'));
        loopItercode(symbolicSubstitution, dictionary, alt, inputs,inputsJason, 0);
        symbolicSubstitution.push(lineInCode( '}','black'));
    }

    else {
        symbolicSubstitution.push(lineInCode('else','black'));
        funcByType[alt.type](symbolicSubstitution,  alt,dictionary, inputs,inputsJason);
    }
}
function substitutionValue(dictionary, valueJason,inputs,symbolicSubstitution){
    return valueType[valueJason.type](dictionary,valueJason,inputs,symbolicSubstitution);
}

const valueType ={
    'Literal': Literal,
    'Identifier' : Identifier,
    'UnaryExpression' : UnaryExpression,
    'BinaryExpression' : BinaryExpression,
    'MemberExpression' : MemberExpression,
    'ArrayExpression' :ArrayExpression
};

function Literal(dictionary,valueJason){
    return escodegen.generate(valueJason);
}
function Identifier(dictionary,valueJason) {
    if(isVarInDictionary(dictionary, escodegen.generate(valueJason)))
        return dictionary[indexVar(dictionary, escodegen.generate(valueJason))].Value;
    else return escodegen.generate(valueJason);
}

function UnaryExpression(dictionary,valueJason,inputs) {
    return valueJason.operator + '(' +substitutionValue(dictionary, valueJason.argument,inputs)+')';
}

function BinaryExpression(dictionary,valueJason,inputs,symbolicSubstitution) {
    //symbolicSubstitution.push(lineInCode('------- left: ' + valueJason.left.type + ' ------- right: ' +valueJason.right.type,''));
    let left = substitutionValue(dictionary, valueJason.left,inputs, symbolicSubstitution);
    let right = substitutionValue(dictionary, valueJason.right,inputs, symbolicSubstitution);
    return '('+ left + ' '+ valueJason.operator +' '+ right+')';
}

function MemberExpression(dictionary,valueJason,inputs, symbolicSubstitution){
    if(isVarInDictionary(dictionary, escodegen.generate(valueJason.object))) {
        let array = JSON.parse( dictionary[indexVar(dictionary, escodegen.generate(valueJason.object))].Value );
        if(!isNaN(substitutionValue(dictionary, valueJason.property,inputs, symbolicSubstitution)))
            return array[substitutionValue(dictionary, valueJason.property,inputs, symbolicSubstitution)];
        else return dictionary[indexVar(dictionary, escodegen.generate(valueJason.object))].Name + '[' + [substitutionValue(dictionary, valueJason.property,inputs, symbolicSubstitution)] + ']';
    }
    else return inputs[indexVar(inputs, escodegen.generate(valueJason.object))].Name+'['+[substitutionValue(dictionary,valueJason.property,inputs, symbolicSubstitution)]+']';

}

function ArrayExpression(dictionary,valueJason) {
    return  escodegen.generate(valueJason);
}

function isGreen(dictionary, test, inputs){
    return eval(calculateValue(dictionary, test, inputs));
}

function calculateValue(dictionary, test, inputs){
    return isGreenType[test.type](dictionary, test, inputs);
}

const isGreenType ={
    'Literal': isGreenLiteral,
    'Identifier' : isGreenIdentifier,
    'UnaryExpression' : isGreenUnaryExpression,
    'BinaryExpression' : isGreenBinaryExpression,
    'MemberExpression' : isGreenMemberExpression
};
function isGreenLiteral(dictionary, valueJason){
    return escodegen.generate(valueJason);
}
function isGreenIdentifier(dictionary,valueJason, inputs) {
    let val;
    if(isVarInDictionary(dictionary, escodegen.generate(valueJason)))
        val = dictionary[indexVar(dictionary, escodegen.generate(valueJason))].Value;
    else //if (isVarInDictionary(inputs, escodegen.generate(valueJason)))
        val = inputs[indexVar(inputs, escodegen.generate(valueJason))].Value;
    return calculateValue(dictionary, parseCode(val).body[0].expression,inputs);
}

function isGreenUnaryExpression(dictionary,valueJason,inputs) {
    return valueJason.operator + '(' +calculateValue(dictionary, valueJason.argument,inputs)+')';
}

function isGreenBinaryExpression(dictionary,valueJason,inputs) {
    let left = calculateValue(dictionary, valueJason.left,inputs);
    let right = calculateValue(dictionary, valueJason.right,inputs);
    return '('+left + ' '+ valueJason.operator +' '+ right + ')';
}

function isGreenMemberExpression(dictionary,valueJason,inputs){
    let array;
    if(isVarInDictionary(dictionary, escodegen.generate(valueJason.object)))
        array =  JSON.parse( dictionary[indexVar(dictionary, escodegen.generate(valueJason.object))].Value );
    else array = JSON.parse( inputs[indexVar(inputs, escodegen.generate(valueJason.object))].Value );
    let index = eval(calculateValue(dictionary, valueJason.property,inputs));
    let val = array[index];
    return val;
}

function copyDictionary(dictionary){
    let d =[];
    for (let i=0; i<dictionary.length; i++) {
        if (dictionary[i]!= undefined)
            d.push(rowInDictionary(dictionary[i].Name, dictionary[i].Value));
    }
    return d;
}

function isVarInDictionary(dic, variable){
    for (let i=0; i<dic.length; i++){
        if (dic[i]!= undefined) {
            if (dic[i].Name === variable)
                return true;
        }
    }
    return false;
}

function indexVar(dic, variable){
    for (let i=0; i<dic.length; i++){
        if (dic[i]!= undefined) {
            if (dic[i].Name === variable)
                return i;
        }
    }
}