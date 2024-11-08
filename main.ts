import * as process from "process";
import * as fileSystem from "fs";

import { Compiler } from "./source/compiler/Compiler";
import { Debugger } from "./source/debugger/Debugger";
import { Lexer } from "./source/lexer/Lexer";
import { Parser } from "./source/parser/Parser";

// Pega os argumentos passados para o programa
const processArguments = process.argv.slice(2);

// Procura por um arquivo válido na lista de argumentos
const sourceCodePath = processArguments.find((argument) => fileSystem.existsSync(argument) && fileSystem.lstatSync(argument).isFile());
if (!sourceCodePath) {
	throw new Error("No valid source code file found.");
}

try {
	// Lê o código fonte do arquivo
	const source = fileSystem.readFileSync(sourceCodePath, "utf8");

	// Cria um lexer e um parser para o código fonte
	const lexer = new Lexer(source).lex();
	const parser = new Parser(lexer).parse();

	if (processArguments.includes("--debug")) {
		new Debugger(new Compiler(parser));
	} else {
		new Compiler(parser).execute();
	}
} catch (error) {
	console.error((<Error>error).stack);
}
