import {ActionResultCode} from './action-result/code';
import {ActionResultOptions} from './action-result/options';
import {ActionResultState} from './action-result/state';

export class ActionResult {
	public readonly state: ActionResultState;
	public code: ActionResultCode;
	public payload: any;

	constructor(options?: ActionResultOptions) {
		this.state = new ActionResultState(options);
		this.code = ActionResultCode.NOT_SET;
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
		this.code = ActionResultCode.FAILURE;
		return this;
	}

	public succeed(): ActionResult {
		this.code = ActionResultCode.SUCCESS;
		return this;
	}

	public complete(): ActionResult {
		if (this.state.hasFailed()) {
			this.code = ActionResultCode.FAILURE;
		} else {
			this.code = ActionResultCode.SUCCESS;
		}

		return this;
	}
}
