import readline from "node:readline";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
	process.stdin.setRawMode(true);
}

import * as Compiler from "../compiler/Compiler";
import * as Value from "../compiler/Value";

import * as Exceptions from "./Exceptions";

class Debugger {
	// Referência para a função de log original
	private __logger = console.log;

	// Iterador que controla o fluxo de execução do programa
	private __programGenerator: Generator<void | Value.BaseValue>;

	constructor(public readonly program: Compiler.Compiler) {
		// Reestringe a saída de log para evitar poluição
		console.log = () => {};

		process.stdin.on("keypress", (_, key) => {
			switch (key.name) {
				case "f1":
					this.__stepForward();
					break;

				case "f2":
					this.__stepBackward();
					break;

				case "q":
					throw new Exceptions.ProgramExit();

				default:
					break;
			}
		});

		this.__programGenerator = this.generate();
	}

	/**
	 *
	 */
	public *generate(): Generator<void | Value.BaseValue> {
		yield* this.program.debug(this);
	}

	/**
	 *
	 */
	private __stepForward() {
		const { done } = this.__programGenerator.next();
		if (done) {
			throw new Exceptions.ProgramFinished();
		}
	}

	/**
	 *
	 */
	private __stepBackward() {}
}

export { Debugger };
