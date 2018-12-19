import assert from 'assert';
import {itercode,parseCode} from '../src/js/code-analyzer';

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














