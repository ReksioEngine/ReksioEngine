import ReksioLangVisitor from "./ReksioLangVisitor";
import ReksioLangParser, {
    ExprContext,
    MethodCallArgumentsContext,
    MethodCallContext, OperationContext, OperationGroupingContext,
    StatementContext,
    StatementListContext, VariableContext
} from "./ReksioLangParser";
import ReksioLangLexer from "./ReksioLangLexer";
import antlr4, {ParserRuleContext} from "antlr4";

class ExecutionError extends Error {
    constructor(ctx: ParserRuleContext, msg: string) {
        super(msg);
    }
}

export class ScriptEvaluator extends ReksioLangVisitor<any> {
    private readonly scope: Record<string, any>;

    constructor(scope: Record<string, any>) {
        super();
        this.scope = scope;
    }

    visitStatementList = (ctx: StatementListContext): any => {
        ctx.statement_list().forEach(statement => {
            this.visitStatement(statement);
        });
    }

    visitStatement = (ctx: StatementContext): any => {
        return this.visit(ctx.expr());
    }

    visitExpr = (ctx: ExprContext): any => {
        if (ctx.TRUE() != null) {
            return true;
        } else if (ctx.FALSE() != null) {
            return false;
        } else if (ctx.NUMBER() != null) {
            return parseInt(ctx.NUMBER().getText());
        } else if (ctx.STRING() != null) {
            return ctx.STRING().getText().substring(1, ctx.STRING().getText().length - 1);
        }

        return this.visitChildren(ctx)[0];
    }

    visitMethodCall = (ctx: MethodCallContext): any => {
        const objectName = ctx.variable().getText();
        const object = this.visitVariable(ctx.variable());

        const methodName = ctx.methodName().getText();
        const method = object[methodName];
        if (method == undefined) {
            throw new ExecutionError(ctx, `Unknown method '${objectName}^${methodName}'`);
        }

        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : [];
        return method(...args);
    }

    visitMethodCallArguments = (ctx: MethodCallArgumentsContext): any => {
        return ctx.expr_list().map(expr => this.visitExpr(expr));
    }

    visitVariable = (ctx: VariableContext): any => {
        if (!this.scope.hasOwnProperty(ctx.getText())) {
            throw new ExecutionError(ctx, `Unknown identifier '${ctx.getText()}'`);
        }

        return this.scope[ctx.getText()];
    }

    visitOperationGrouping = (ctx: OperationGroupingContext): any => {
        return this.visitOperation(ctx.operation());
    }

    visitOperation = (ctx: OperationContext): any => {
        if (ctx.expr() != null) {
            return this.visitExpr(ctx.expr());
        }

        const left = this.visitOperation(ctx._left);
        const right = this.visitOperation(ctx._right);

        if (ctx._operator.type == ReksioLangParser.PLUS) {
            return left + right;
        } else if (ctx._operator.type == ReksioLangParser.MINUS) {
            return left - right;
        }
    }
}

export const runScript = (scope: object, script: string) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(script));
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new ReksioLangParser(tokens);
    const tree = parser.statementList();
    tree.accept(new ScriptEvaluator(scope));
}
