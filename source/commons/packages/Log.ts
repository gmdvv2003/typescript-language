import * as Context from "../../compiler/Context";
import * as Value from "../../compiler/Value";

class __Log {
	/**
	 *
	 * @param parameters
	 */
	static escreva(_: Context.Context, ...parameters: Value.BaseValue[]): void {
		console.log(parameters.map((parameter) => parameter.toString()).join(" "));
	}
}

export { __Log };
