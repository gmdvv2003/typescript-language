import { Compiler } from "./source/compiler/Compiler";
import { Lexer } from "./source/lexer/Lexer";
import { Parser } from "./source/parser/Parser";

const source = `
bloco
	escreva("Olá, Mundo!")
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
