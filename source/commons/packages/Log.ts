import { Context } from "../../compiler/Context";
import { BaseValue } from "../../compiler/Value";

class __Log {
	/**
	 *
	 * @param parameters
	 */
	static escreva(_: Context, ...parameters: BaseValue[]): void {
		console.log(parameters.map((parameter) => parameter.toString()).join(" "));
	}
}

export { __Log };
