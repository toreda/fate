import {ActionResultCode} from './action-result/code';
import {ActionResultOptions} from './action-result/options';
import {ActionResultState} from './action-result/state';

export class ActionResult<T = unknown> {
	public readonly state: ActionResultState<T>;

	constructor(options?: ActionResultOptions<T>) {
		this.state = new ActionResultState(options);
	}

	public error(error: unknown): ActionResult<T> {
		if (Array.isArray(error)) {
			error.forEach(this.error, this);
		} else if (error instanceof Error) {
			this.state.errorLog.push(error);
		} else if (checkIsToStringable(error)) {
			this.state.errorLog.push(Error(error.toString()));
		} else {
			this.state.errorLog.push(Error(JSON.stringify(error)));
		}

		if (!this.isFailure() && this.state.hasFailed()) {
			this.state.forceFailure();
		}

		return this;
	}

	public message(message: unknown): ActionResult<T> {
		if (Array.isArray(message)) {
			message.forEach(this.message, this);
		} else if (typeof message === 'string') {
			this.state.messageLog.push(message);
		} else if (checkIsToStringable(message)) {
			this.state.messageLog.push(message.toString());
		} else {
			this.state.messageLog.push(JSON.stringify(message));
		}

		return this;
	}

	public complete(): ActionResult<T> {
		if (this.state.hasFailed()) {
			this.state.forceFailure();
			return this;
		}

		if (this.state.payload != null) {
			this.state.forceSuccess();
			return this;
		}

		return this;
	}

	public getData(): T | Error[] {
		if (this.complete().isFailure()) {
			return this.state.errorLog;
		}

		if (this.state.payload == null) {
			return [Error('payload is null')];
		}

		return this.state.payload;
	}

	public isFailure(): boolean {
		this.complete();
		return this.state.code === ActionResultCode.FAILURE;
	}

	public isSuccess(): boolean {
		this.complete();
		return this.state.code === ActionResultCode.SUCCESS;
	}

	public serialize(): string {
		return this.state.serialize();
	}
}

type ToStringable = {toString: () => string};

function checkIsToStringable(mightBeToStringable: unknown): mightBeToStringable is ToStringable {
	if (mightBeToStringable == null) {
		return false;
	}

	const assumeToStringable = mightBeToStringable as ToStringable;

	if (typeof assumeToStringable.toString !== 'function') {
		return false;
	}

	if (assumeToStringable.toString === Object.prototype.toString) {
		return false;
	}

	return true;
}
