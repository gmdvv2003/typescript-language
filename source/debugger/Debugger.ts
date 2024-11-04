import readline from "node:readline";

// Redireciona os eventos de teclado para o stdin (console)
readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
	process.stdin.setRawMode(true);
}

import * as Compiler from "../compiler/Compiler";
import * as Value from "../compiler/Value";
import * as Nodes from "../parser/Nodes";

import * as Exceptions from "./Exceptions";

/**
 *
 * @returns
 */
export function capture<T extends Nodes.Node>() {
	return function (_: any, __: any, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		// Substitui o método original por um novo que captura o nó que está sendo avaliado
		descriptor.value = function* (node: T): Generator<void | Value.BaseValue> {
			const __this = this as Compiler.Compiler;

			// Verifica se o debugger está ativo
			if (!__this.__debugger) {
				return yield* originalMethod.apply(this, [node]);
			}

			// Limpa o resultado da última avaliação
			__this.__debugger.__lastEvaluation = null;

			// Verifica se o nó já está na pilha de avaliação
			if (__this.__debugger.stack[__this.__debugger.stack?.length - 1] === node) {
				return yield* originalMethod.apply(this, [node]);
			}

			// Adiciona o nó à pilha de avaliação
			__this.__debugger.stack?.push(node);

			// Ponto de parada para o início da avaliação
			yield;

			// Chama o método original
			const capture = yield* originalMethod.apply(this, [node]);

			// Atualiza o último nó avaliado
			__this.__debugger.__lastEvaluation = capture;

			// Ponto de parada para o resultado da avaliação
			yield;

			// Remove o nó da pilha de avaliação
			__this.__debugger.stack?.pop();

			return capture;
		};

		return descriptor;
	};
}

class Debugger {
	// Referência para a função de log original
	private __logger = console.log;

	// Iterador que controla o fluxo de execução do programa
	private __programGenerator: Generator<void | Value.BaseValue>;

	// Pilha dos nós que estão sendo avaliados
	public stack: Nodes.Node[] = [];

	// Resultado do último nó avaliado
	public __lastEvaluation: Value.BaseValue | null = null;

	constructor(public readonly program: Compiler.Compiler) {
		this.__logger("Debugger started. Press F1 to step forward, F2 to step backward, F3 to log context or Q to exit.");

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

				case "f3":
					this.__logContext();
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

		// Exibe o nó que está sendo avaliado
		this.__logger(`${this.stack[this.stack.length - 1]} -> ${this.__lastEvaluation}`);
	}

	/**
	 *
	 */
	private __stepBackward() {}

	/**
	 *
	 */
	private __logContext() {
		// Filtra os locais que pertencem ao escopo atual
		const locals = this.program.context.locals.filter((local) => local.scopeLevel === this.program.context.scopeLevel);

		if (locals.length == 0) {
			return this.__logger("No locals defined.");
		}

		this.__logger(`${locals.map((local) => `${local.name} = ${local.value}`).join("\n")}`);
	}
}

export { Debugger };
