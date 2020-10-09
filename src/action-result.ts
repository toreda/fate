import {AROptions} from './options';
import {ARState} from './state';
import {ResultCode} from './result-code';

export class ActionResult {
	public readonly state: ARState;
	public code: ResultCode;
	public payload: any;

	constructor(options?: AROptions) {
		this.state = new ARState(options);
		this.code = ResultCode.NOT_SET;
		this.payload = null;
	}

	public messages(messages: string[]): ActionResult {
		if (!Array.isArray(messages)) {
			return this;
		}

		for (const message of messages) {
			if (typeof message !== 'string') {
				continue;
			}

			this.state.messages.push(message);
		}

		return this;
	}

	public message(message: string | string[]): ActionResult {
		if (Array.isArray(message)) {
			return this.messages(message);
		}

		if (typeof message !== 'string') {
			return this;
		}

		this.state.messages.push(message);
		return this;
	}

	public error(errors: Error | Error[]): ActionResult {
		if (Array.isArray(errors)) {
			errors.forEach((error: Error) => {
				this.state.errors.push(error);
			});
		} else {
			this.state.errors.push(errors);
		}

		return this;
	}

	public fail(): ActionResult {
		this.code = ResultCode.FAILURE;
		return this;
	}

	public succeed(): ActionResult {
		this.code = ResultCode.SUCCESS;
		return this;
	}

	public complete(): ActionResult {
		if (this.state.hasFailed()) {
			this.code = ResultCode.FAILURE;
		} else {
			this.code = ResultCode.SUCCESS;
		}

		return this;
	}
}
