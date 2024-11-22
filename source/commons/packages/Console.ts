import * as Context from "../../compiler/Context";
import * as Value from "../../compiler/Value";

import { runLoopOnce } from "deasync";
import { createInterface } from "readline";

class __Console {
	/**
	 *
	 * @param parameters
	 */
	static escreva(_: Context.Context, ...parameters: Value.BaseValue[]): void {
		process.stdout.write(parameters.map((parameter) => parameter.toString()).join(" ") + "\n");
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

	/**
	 * 
	 * @param _ 
	 */
	static limpa(_: Context.Context): void {
		process.stdout.write("\x1Bc");
	}
}

export { __Console };
