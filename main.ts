import { Compiler } from "./source/compiler/Compiler";
import { Debugger } from "./source/debugger/Debugger";
import { Lexer } from "./source/lexer/Lexer";
import { Parser } from "./source/parser/Parser";

const source = `
bloco
	declarar a = 5
	declarar b = 10
	declarar c = a + b
	escreva(c)
fim
`;

try {
	const lexer = new Lexer(source);
	const tokens = lexer.lex();

	const parser = new Parser(tokens);
	const program = parser.parse();

	const compiler = new Compiler(program);
	compiler.execute();
} catch (exception) {
	console.error((<Error>exception).message);
}
