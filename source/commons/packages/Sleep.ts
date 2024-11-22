import * as Context from "../../compiler/Context";
import * as Value from "../../compiler/Value";

import { sleep } from "deasync";

class __Sleep {
	/**
	 *
	 * @param _
	 */
	static aguarde(_: Context.Context, time: Value.NumberValue): void {
		sleep(time.value * 1000);
	}
}

export { __Sleep };
