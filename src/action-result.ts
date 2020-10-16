import {ActionResultCode} from './action-result/code';
import {ActionResultOptions} from './action-result/options';
import {ActionResultState} from './action-result/state';

export class ActionResult<T> {
	public readonly state: ActionResultState;
	public code: ActionResultCode;
	public payload: T | null;

	constructor(options?: ActionResultOptions) {
		this.state = new ActionResultState(options);
		this.code = ActionResultCode.NOT_SET;
		this.payload = null;
	}

	public messages(messages: string[]): ActionResult<T> {
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

	public message(message: string | string[]): ActionResult<T> {
		if (Array.isArray(message)) {
			return this.messages(message);
		}

		if (typeof message !== 'string') {
			return this;
		}

		this.state.messages.push(message);
		return this;
	}

	public error(errors: Error | Error[]): ActionResult<T> {
		if (Array.isArray(errors)) {
			errors.forEach((error: Error) => {
				this.state.errors.push(error);
			});
		} else {
			this.state.errors.push(errors);
		}

		return this;
	}

	public fail(): ActionResult<T> {
		this.code = ActionResultCode.FAILURE;
		return this;
	}

	public succeed(): ActionResult<T> {
		this.code = ActionResultCode.SUCCESS;
		return this;
	}

	public complete(): ActionResult<T> {
		if (this.state.hasFailed()) {
			this.code = ActionResultCode.FAILURE;
		} else {
			this.code = ActionResultCode.SUCCESS;
		}

		return this;
	}
}
