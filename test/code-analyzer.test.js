import assert from 'assert';
import {itercode,parseCode,functionDeclaration,variableDeclaration,expressionStatement,whileStatement, ifStatement} from '../src/js/code-analyzer';
import {copyDictionary,isVarInDictionary,indexVar} from '../src/js/code-analyzer';

let dictionary1 =[], inputs1 = [], symbolicSubstitution1 = [];
functionDeclaration(symbolicSubstitution1,parseCode('function f(x,y){}').body[0],dictionary1,inputs1, parseCode('1,2'));
describe('functionDeclaration', () => {
    it('functionDeclaration', () => {
        assert.deepEqual(dictionary1, []);
        assert.deepEqual(inputs1, [{Name:'x',Value:1},{Name:'y',Value:2}]);
        assert.deepEqual(symbolicSubstitution1, [{Line:'function f(x, y){', Color:'black'},{Line:'}', Color:'black'}]);
    });
});

let dictionary2 =[],inputs2 = [], symbolicSubstitution2 = [];
variableDeclaration(symbolicSubstitution2 ,parseCode('let e = 7;').body[0],dictionary2,inputs2);
describe('variableDeclaration', () => {
    it('variableDeclaration', () => {
        assert.deepEqual(dictionary2, [{Name:'e',Value:7}]);
        assert.deepEqual(inputs2, []);
        assert.deepEqual(symbolicSubstitution2, []);
    });
});

let dictionary3 =[],inputs3 = [{Name:'x',Value:1}], symbolicSubstitution3 = [];
expressionStatement(symbolicSubstitution3 ,parseCode('x=88;').body[0],dictionary3,inputs3);
describe('expressionStatement', () => {
    it('expressionStatement', () => {
        assert.deepEqual(dictionary3, []);
        assert.deepEqual(inputs3, [{Name:'x',Value:88}]);
        assert.deepEqual(symbolicSubstitution3, [{Line:'x = 88;', Color:'black'}]);
    });
});

let dictionary4=[],inputs4 = [], symbolicSubstitution4 = [];
functionDeclaration(symbolicSubstitution4 ,parseCode('function f(){return 4;}').body[0],dictionary4,inputs4, parseCode(''));
describe('returnStatement', () => {
    it('returnStatement', () => {
        assert.deepEqual(dictionary4, []);
        assert.deepEqual(inputs4, []);
        assert.deepEqual(symbolicSubstitution4, [{Line:'function f(){', Color:'black'},{Line:'return 4;', Color:'black'},{Line:'}', Color:'black'}]);
    });
});

let dictionary5=[],inputs5 = [], symbolicSubstitution5 = [];
whileStatement(symbolicSubstitution5 ,parseCode('while(1){}').body[0],dictionary5,inputs5);
describe('whileStatement', () => {
    it('whileStatement', () => {
        assert.deepEqual(dictionary5, []);
        assert.deepEqual(inputs5, []);
        assert.deepEqual(symbolicSubstitution5, [{Line:'while (1){', Color:'black'},{Line:'}', Color:'black'}]);
    });
});

let dictionary6=[],inputs6 = [], symbolicSubstitution6 = [];
ifStatement(symbolicSubstitution6 ,parseCode('if(1){}else{}').body[0],dictionary6,inputs6);
describe('ifStatement', () => {
    it('ifStatement', () => {
        assert.deepEqual(dictionary6, []);
        assert.deepEqual(inputs6, []);
        assert.deepEqual(symbolicSubstitution6, [{Line:'if (1){', Color:'green'},{Line:'}', Color:'black'},{Line:'else {', Color:'black'},{Line:'}', Color:'black'}]);
    });
});

let dictionary7=[],inputs7 = [], symbolicSubstitution7 = [];
ifStatement(symbolicSubstitution7 ,parseCode('if(1){}else if(0){}').body[0],dictionary7,inputs7);
describe('ifStatement', () => {
    it('ifStatement', () => {
        assert.deepEqual(dictionary7, []);
        assert.deepEqual(inputs7, []);
        assert.deepEqual(symbolicSubstitution7, [{Line:'if (1){', Color:'green'},{Line:'}', Color:'black'},{Line:'else if (0){', Color:'red'},{Line:'}', Color:'black'}]);
    });
});


let d = [{Name:'a',Value:7}, {Name:'b',Value:-7}, {Name:'c',Value:'talia'}, {Name:'d',Value:[0,-1,'xxx']}];
describe('copyDictionary', () => {
    it('copyDictionary', () => {
        assert.deepEqual([{Name:'a',Value:7}, {Name:'b',Value:-7}, {Name:'c',Value:'talia'}, {Name:'d',Value:[0,-1,'xxx']}], copyDictionary(d));
    });
});
describe('isVarInDictionary', () => {
    it('isVarInDictionary', () => {
        assert.deepEqual(true, isVarInDictionary(d, 'a'));
        assert.deepEqual(false, isVarInDictionary(d, 'y'));
    });
});
describe('indexVar', () => {
    it('indexVar', () => {
        assert.deepEqual(0, indexVar(d, 'a'));
        assert.deepEqual(3, indexVar(d, 'd'));
    });
});


describe('empty function test', () => {
    it('is parsing an empty function correctly', () => {
        assert.deepEqual(
            itercode(parseCode(''), parseCode('')),
            []
        );
    });
});

describe('TEST1 The javascript parser', () => {
    it('function args=0', () => {
        assert.deepEqual(
            itercode(parseCode('function f(){return 3;}'),parseCode('')),
            [{Line: 'function f(){', Color:'black'},
                {Line: 'return 3;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});


describe('TEST2 The javascript parser', () => {
    it('function args=1', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x){return x;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'return x;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST3 The javascript parser', () => {
    it('function args=1 and local var', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x){' +
                'let y=5;'+
                'return x+y;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'return (x + 5);', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });

});


describe('TEST The javascript parser', () => {
    it('function args=1 and local var', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x){' +
                'let y;'+
                'y=5;'+
                'return x+y;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'return (x + 5);', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});


describe('TEST4 The javascript parser', () => {
    it('function args=1 and global var', () => {
        assert.deepEqual(
            itercode(parseCode('let y=5;'+
                'function f(x){' +
                'return x+y;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'return (x + 5);', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST5 The javascript parser', () => {
    it('function args=1 and global vars', () => {
        assert.deepEqual(
            itercode(parseCode('let x=5; let y=0;'+
                'function f(x){' +
                'return x+y;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'return (x + 0);', Color:'black'}, {Line: '}', Color:'black'}]
        );
    });
    it('function args=0 and global vars', () => {
        assert.deepEqual(
            itercode(parseCode('let x=5;'+
                'function f(){' + ' let x=0;'+
                'return 0;}'),parseCode('')),
            [{Line: 'function f(){', Color:'black'},
                {Line: 'return 0;', Color:'black'}, {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST6 The javascript parser', () => {
    it('function args=2', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x,y){return x*y;}'),parseCode('1,2')),
            [{Line: 'function f(x, y){', Color:'black'},
                {Line: 'return (x * y);', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST7 The javascript parser', () => {
    it('if green', () => {
        assert.deepEqual(
            itercode(parseCode('function f(){'+
        'if(1<2) return 3;}'),parseCode('')),
            [{Line: 'function f(){', Color:'black'},
                {Line: 'if ((1 < 2))', Color:'green'},
                {Line: 'return 3;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST8 The javascript parser', () => {
    it('if red and local var expressionStatement', () => {
        assert.deepEqual(
            itercode(parseCode('function f(){'+
                'let a=1;'+
                'a=3;'+
                'if(a<2) return 3;}'),parseCode('')),
            [{Line: 'function f(){', Color:'black'},
                {Line: 'if ((3 < 2))', Color:'red'},
                {Line: 'return 3;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST9 The javascript parser', () => {
    it('function args=1 and delete global var', () => {
        assert.deepEqual(
            itercode(parseCode('let x=5;'+
                'function f(x){' +
                'if(x==1)'+
                'return x;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'if ((x == 1))', Color:'green'},
                {Line: 'return x;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST10 The javascript parser', () => {
    it('exsample: function args=3 and else if BS', () => {
        assert.deepEqual(
            itercode(parseCode('function foo(x, y, z){'+
        'let a = x + 1;'+ 'let b = a + y;'+ 'let c = 0;'+
        'if (b < z) {'+ 'c = c + 5; return x + y + z + c;'+
        '} else if (b < z * 2) {'+ 'c = c + x + 5;'+ 'return x + y + z + c;'+
        '} else {'+ 'c = c + z + 5;'+ 'return x + y + z + c;}}'),parseCode('1,2,3')),
            [{Line: 'function foo(x, y, z){', Color:'black'},
                {Line: 'if ((((x + 1) + y) < z)){', Color:'red'},
                {Line: 'return (((x + y) + z) + (0 + 5));', Color:'black'}, {Line: '}', Color:'black'},
                {Line: 'else if ((((x + 1) + y) < (z * 2))){', Color:'green'},
                {Line: 'return (((x + y) + z) + ((0 + x) + 5));', Color:'black'}, {Line: '}', Color:'black'},
                {Line: 'else {', Color:'black'},
                {Line: 'return (((x + y) + z) + ((0 + z) + 5));', Color:'black'},
                {Line: '}', Color:'black'}, {Line: '}', Color:'black'}]
        );
    });
});

describe('The javascript parser', () => {
    it('exsample: function args=3 and while', () => {
        assert.deepEqual(
            itercode(parseCode('function foo(x, y, z){'+
        'let a = x + 1; let b = a + y; let c = 0;'+
        'while (a < z) {'+
            'c = a + b;'+
            'z = c * 2;'+
        '}'+
        'return z;'+
    '}'),parseCode('1,2,3')),
            [{Line: 'function foo(x, y, z){', Color:'black'},
                {Line: 'while (((x + 1) < z)){', Color:'black'},
                {Line: 'z = (((x + 1) + ((x + 1) + y)) * 2);', Color:'black'},
                {Line: '}', Color:'black'},
                {Line: 'return z;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});


describe('TEST11 The javascript parser', () => {
    it('while', () => {
        assert.deepEqual(
            itercode(parseCode('while(true){}'),parseCode('')),
            [{Line: 'while (true){', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST12 The javascript parser', () => {
    it('param expressionStatement', () => {
        assert.deepEqual(
            itercode(parseCode('function f(c){'+
                'c=5;}'),parseCode('4')),
            [{Line: 'function f(c){', Color:'black'},
                {Line: 'c = 5;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
    it('function args=1 UnaryExpression', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x){let r=4+x; return -r;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'return -((4 + x));', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});


describe('TEST13 The javascript parser', () => {
    it('if UnaryExpression', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x){'+
                'if(-x + 1) return 22;'+
                'let r=4+x; return -r;}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'if ((-(x) + 1))', Color:'red'},
                {Line: 'return 22;', Color:'black'},
                {Line: 'return -((4 + x));', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST14 The javascript parser', () => {
    it('ArrayExpression local array', () => {
        assert.deepEqual(
            itercode(parseCode('function f(){let t=[-4,0,1];'+
                'if(t[1]) return t[0];'+
                'else if(t[2]) return t[2];'+
                'else return t[2];}'),parseCode('')),
            [{Line: 'function f(){', Color:'black'},
                {Line: 'if (0)', Color:'red'},
                {Line: 'return -4;', Color:'black'},
                {Line: 'else if (1)', Color:'green'},
                {Line: 'return 1;', Color:'black'},
                {Line: 'else', Color:'black'},
                {Line: 'return 1;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('The javascript parser', () => {
    it('if, else', () => {
        assert.deepEqual(
            itercode(parseCode('function f(){let t=[-4,0,1];'+
                'if(t[1]) return t[0];'+
                'else return t[2];}'),parseCode('')),
            [{Line: 'function f(){', Color:'black'},
                {Line: 'if (0)', Color:'red'}, {Line: 'return -4;', Color:'black'},
                {Line: 'else', Color:'black'}, {Line: 'return 1;', Color:'black'}, {Line: '}', Color:'black'}]
        );});
    it('if, else if whitout else', () => {
        assert.deepEqual(
            itercode(parseCode('function f(){let t=[-4,0,1];'+
                'if(t[1]) return t[0];'+
                'else if(t[2]) return t[2]}'),parseCode('')),
            [{Line: 'function f(){', Color:'black'},
                {Line: 'if (0)', Color:'red'}, {Line: 'return -4;', Color:'black'},
                {Line: 'else if (1)', Color:'green'}, {Line: 'return 1;', Color:'black'}, {Line: '}', Color:'black'}]
        );});
});

describe('TEST15 The javascript parser', () => {
    it('ArrayExpression param array', () => {
        assert.deepEqual(
            itercode(parseCode('function f(t){' +
                'if(t[1]) return t[0];'+
                'else if(t[2]) return t[2];'+
                'else return t[2];}'),parseCode('[-4,0,1]')),
            [{Line: 'function f(t){', Color:'black'},
                {Line: 'if (t[1])', Color:'red'},
                {Line: 'return t[0];', Color:'black'},
                {Line: 'else if (t[2])', Color:'green'},
                {Line: 'return t[2];', Color:'black'},
                {Line: 'else', Color:'black'},
                {Line: 'return t[2];', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST16 The javascript parser', () => {
    it('ArrayExpression local array ,param index', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x){let t=[-4,0,1];'+
                'if(t[x]) return t[0];'+
                'else if(t[2]) return t[2];'+
                'else return t[2];}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'if (t[x])', Color:'red'},
                {Line: 'return -4;', Color:'black'},
                {Line: 'else if (1)', Color:'green'},
                {Line: 'return 1;', Color:'black'},
                {Line: 'else', Color:'black'},
                {Line: 'return 1;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

describe('TEST17 The javascript parser', () => {
    it('ArrayExpression local array ,param index', () => {
        assert.deepEqual(
            itercode(parseCode('function f(x){let t=[-4,0,1];'+
                'if(t[x+1]) return t[0];'+
                'else if(t[1]+t[2]) return t[2];'+
                'else if(t[1]+t[2]) return t[2];'+
                'else return t[2];}'),parseCode('1')),
            [{Line: 'function f(x){', Color:'black'},
                {Line: 'if (t[(x + 1)])', Color:'green'},
                {Line: 'return -4;', Color:'black'},
                {Line: 'else if ((0 + 1))', Color:'green'},
                {Line: 'return 1;', Color:'black'},
                {Line: 'else if ((0 + 1))', Color:'green'},
                {Line: 'return 1;', Color:'black'},
                {Line: 'else', Color:'black'}, {Line: 'return 1;', Color:'black'},
                {Line: '}', Color:'black'}]
        );
    });
});

