import * as Context from "../../compiler/Context";
import * as Value from "../../compiler/Value";

import { runLoopOnce } from "deasync";
import { createInterface } from "node:readline";

class __Log {
	/**
	 *
	 * @param parameters
	 */
	static escreva(_: Context.Context, ...parameters: Value.BaseValue[]): void {
		console.log(parameters.map((parameter) => parameter.toString()).join(" "));
	}

	/**
	 *
	 * @param _
	 */
	static leia(_: Context.Context, question: Value.StringObject): Value.StringObject {
		const readline = createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		let result = null;

		// Captura a entrada do usuário
		readline.question(question.value, (answer: string) => {
			result = answer;
		});

		// Aguarda a resposta do usuário
		while (result === null) {
			runLoopOnce();
		}

		// Fecha a interface de leitura
		readline.close();

		return Value.STRING(result);
	}
}

export { __Log };
