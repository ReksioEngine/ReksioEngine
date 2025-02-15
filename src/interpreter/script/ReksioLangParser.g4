parser grammar ReksioLangParser;
options {tokenVocab = ReksioLangLexer ;}

expr :
    comment? (
        string
        | number
        | bool
        | objectValueReference
        | specialCall
        | methodCall
        | operationGrouping
    );

statement: | expr;
statementList: (statement STATEMENT_END)* EOF;

methodCall: objectName METHOD_CALL_SYMBOL methodName BRACKET_START methodCallArguments? BRACKET_END;
objectName: identifier;
methodName: identifier;
methodCallArguments: expr (COMMA expr)*;

specialCall: AT methodName BRACKET_START methodCallArguments? BRACKET_END;

operationGrouping: OPERATION_GROUPING_START operation OPERATION_GROUPING_END;
operation
  : left=expr operator=PLUS right=expr
  | left=expr operator=MINUS right=expr
  | left=expr operator=ASTERISK right=expr
  | left=expr operator=PERCENTAGE right=expr
  | left=expr operator=AT right=expr
  ;

comment: COMMENT_START;
number: MINUS NUMBER | NUMBER;
bool: TRUE | FALSE;
string: CODE_STRING | STRING;

objectValueReference: identifier;
identifier: dereference=ASTERISK? IDENTIFIER;
