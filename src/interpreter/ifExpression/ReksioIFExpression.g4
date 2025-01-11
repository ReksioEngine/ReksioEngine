grammar ReksioIFExpression;

exprList: expr (logicOperator expr)* EOF;

expr
: left=value operator=EQUAL right=value
| left=value operator=NOT_EQUAL right=value
| left=value operator=GREATER right=value
| left=value operator=SMALLER right=value
| left=value operator=GREATER_EQUAL right=value
| left=value operator=SMALLER_EQUAL right=value
;
value: identifier | string | number;

number: '-' NUMBER | NUMBER;
string: STRING;
identifier: IDENTIFIER;
logicOperator: AND | OR;

EQUAL: '\'';
NOT_EQUAL: '!\'';
GREATER: '>';
SMALLER: '<';
GREATER_EQUAL: '>\'';
SMALLER_EQUAL: '<\'';

AND: '&&';
OR: '||';

IDENTIFIER: [a-zA-Z0-9_$]*[a-zA-Z_?$]+[a-zA-Z0-9_$]*;
NUMBER: [0-9]+ ('.' [0-9]+)? ;
STRING: '"' ~[,)]* '"';

WHITESPACE: [ \t\u000C\r\n]+ -> skip;
