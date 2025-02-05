import ReksioLangParser, {
    BoolContext,
    IdentifierContext,
    MethodCallArgumentsContext,
    NumberContext,
    StringContext,
} from '../script/ReksioLangParser'
import ReksioLangLexer from '../script/ReksioLangLexer'
import antlr4 from 'antlr4'
import ReksioLangParserVisitor from '../script/ReksioLangParserVisitor'
import { ForceNumber } from '../../common/types'

export class ConstantArgsEvaluator extends ReksioLangParserVisitor<any> {
    visitIdentifier = (ctx: IdentifierContext): any => {
        return ctx.IDENTIFIER().getText()
    }

    visitMethodCallArguments = (ctx: MethodCallArgumentsContext): any => {
        return ctx.expr_list().map((expr) => this.visitChildren(expr)[0])
    }

    visitBool = (ctx: BoolContext): any => {
        return ctx.TRUE() !== null
    }

    visitNumber = (ctx: NumberContext): any => {
        return ForceNumber(ctx.getText())
    }

    visitString = (ctx: StringContext): any => {
        return ctx.STRING().getText().replace(/^"|"$/g, '')
    }
}

export const parseConstantArgs = (argsString: string) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(argsString))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
    const tree = parser.methodCallArguments()
    return tree.accept(new ConstantArgsEvaluator())
}
