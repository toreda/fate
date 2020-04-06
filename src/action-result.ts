import {ArmorActionResultCode} from './code';
import {ArmorActionResultOptions} from './options';
import {ArmorActionResultState} from './state';

export class ArmorActionResult {
	public readonly state: ArmorActionResultState;
	public code: ArmorActionResultCode;

	constructor(options?: ArmorActionResultOptions) {
		this.state = new ArmorActionResultState();
		this.code = ArmorActionResultCode.NOT_SET;
	}

	public start(): ArmorActionResult {
		return this;
	}

	public message(messages: string | string[]): ArmorActionResult {
		if (Array.isArray(messages)) {
			messages.forEach((message: any) => {
				if (typeof message !== 'string') {
					return;
				}

				this.state.messages.push(message);
			});
		} else if (typeof messages === 'string') {
			this.state.messages.push(messages);
		}

		return this;
	}

	public error(errors: Error | Error[]): ArmorActionResult {
		return this;
	}

	public failure(): ArmorActionResult {
		this.code = ArmorActionResultCode.FAILURE;
		return this;
	}

	public success(): ArmorActionResult {
		this.code = ArmorActionResultCode.SUCCESS;
		return this;
	}

	public complete(): ArmorActionResult {
		if (this.state.hasFailed()) {
			this.code = ArmorActionResultCode.FAILURE;
		} else {
			this.code = ArmorActionResultCode.SUCCESS;
		}

		return this;
	}
}
