grammar ReksioLang;

// Keywords
TRUE : 'TRUE';
FALSE: 'FALSE';

expr :
    comment? (
        string
        | number
        | bool
        | identifier
        | specialCall
        | methodCall
        | operationGrouping
    );

statement: | expr;
statementList: (statement STATEMENT_END)* EOF;

methodCall: objectName METHOD_CALL_SYMBOL methodName '(' methodCallArguments? ')';
objectName: identifier;
methodName: identifier;
methodCallArguments: expr (',' expr)*;

specialCall: '@' methodName '(' methodCallArguments? ')';

operationGrouping: '[' operation ']';
operation
  : left=operation operator=ADD right=operation
  | left=operation operator=SUB right=operation
  | left=operation operator=MUL right=operation
  | left=operation operator=MOD right=operation
  | left=operation operator=DIV right=operation
  | expr
  ;

comment: COMMENT_START;
number: SUB NUMBER | NUMBER;
bool: TRUE | FALSE;
string: CODE_STRING | STRING;
identifier: IDENTIFIER;

// Literals
IDENTIFIER: [a-zA-Z0-9_$\-]+ { this.text.match(/[A-Za-z$]/) !== null }? ;
NUMBER: [0-9]+ ('.' [0-9]+)? ;
CODE_STRING: '"{' ~[{]* '}"';
STRING: '"' ~[,)]* '"';
COMMENT_START: '!'+;

ADD: '+';
SUB: '-';
MUL: '*';
MOD: '%';
DIV: '@';

METHOD_CALL_SYMBOL: '^';
STATEMENT_END: ';';

// Inconsistency
TYPO: [>:];

WHITESPACE: [ \t\u000C\r\n]+ -> skip;