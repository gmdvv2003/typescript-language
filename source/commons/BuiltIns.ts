import * as Value from "../compiler/Value";
import * as Context from "../compiler/Context";

import { __Log as Log } from "./packages/Log";
import { __Math as Math } from "./packages/Math";

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
			Math: Value.DICTIONARY({
				PI: Math.PI,
				TAU: Math.TAU,

				Seno: this.wrapInternal(Math.seno),
				Cosseno: this.wrapInternal(Math.cosseno),
				Tangente: this.wrapInternal(Math.tangente),

				Potencia: this.wrapInternal(Math.potencia),
				Raiz: this.wrapInternal(Math.raiz),
			}),

			// ===== Log ===== //
			Log: Value.DICTIONARY({
				Escreva: this.wrapInternal(Log.escreva),
				Leia: this.wrapInternal(Log.leia),
			}),
		};
	}
}

export { BuiltIns };
