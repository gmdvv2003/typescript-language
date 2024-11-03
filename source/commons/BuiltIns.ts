import { Context } from "../compiler/Context";

import { __Log as Log } from "./packages/Log";
import { __Math as Math } from "./packages/Math";

interface BuiltInFunction {
	(context: Context, ...any: any[]): any;
}

class BuiltIns {
	constructor(private readonly context: Context) {}

	/**
	 *
	 * @param callback
	 * @returns
	 */
	private wrapInternal(callback: BuiltInFunction): (...any: any[]) => any {
		return (...any: any[]) => {
			return callback(this.context, ...any);
		};
	}

	/**
	 *
	 * @returns
	 */
	public load(): { [key: string]: BuiltInFunction | any } {
		return {
			// ===== Math ===== //
			PI: Math.PI,
			TAU: Math.TAU,

			seno: this.wrapInternal(Math.seno),
			cosseno: this.wrapInternal(Math.cosseno),
			tangente: this.wrapInternal(Math.tangente),

			potencia: this.wrapInternal(Math.potencia),
			raiz: this.wrapInternal(Math.raiz),

			// ===== Log ===== //
			escreva: this.wrapInternal(Log.escreva),
		};
	}
}

export { BuiltIns };
