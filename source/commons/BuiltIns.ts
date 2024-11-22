import * as Value from "../compiler/Value";
import * as Context from "../compiler/Context";

import { __Console as Console } from "./packages/Console";
import { __Math as Math } from "./packages/Math";
import { __Sleep as Sleep } from "./packages/Sleep";

interface BuiltInFunction {
	(context: Context.Context, ...any: any[]): any;
}

class BuiltIns {
	constructor(private readonly context: Context.Context) {}

	/**
	 *
	 * @param callback
	 * @returns
	 */
	private wrapInternal(callback: BuiltInFunction): Value.BuiltInCodeObject {
		return new Value.BuiltInCodeObject((...any: any[]) => {
			return callback(this.context, ...any);
		});
	}

	/**
	 *
	 * @returns
	 */
	public load(): { [key: string]: Value.BaseValue } {
		return {
			// ===== Math ===== //
			math: Value.DICTIONARY({
				PI: Math.PI,
				TAU: Math.TAU,

				absoluto: this.wrapInternal(Math.absoluto),

				seno: this.wrapInternal(Math.seno),
				cosseno: this.wrapInternal(Math.cosseno),
				tangente: this.wrapInternal(Math.tangente),

				potencia: this.wrapInternal(Math.potencia),
				raiz: this.wrapInternal(Math.raiz),

				teto: this.wrapInternal(Math.teto),
				chao: this.wrapInternal(Math.chao),

				aleatorio: this.wrapInternal(Math.aleatorio),
			}),

			// ===== Console ===== //
			console: Value.DICTIONARY({
				escreva: this.wrapInternal(Console.escreva),
				leia: this.wrapInternal(Console.leia),
				limpa: this.wrapInternal(Console.limpa),
			}),

			// ===== Sleep ===== //
			sleep: Value.DICTIONARY({
				aguarde: this.wrapInternal(Sleep.aguarde),
			}),
		};
	}
}

export { BuiltIns };
