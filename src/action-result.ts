import {ActionResultCode} from './action-result/code';
import {ActionResultOptions} from './action-result/options';
import {ActionResultState} from './action-result/state';

export class ActionResult<T> {
	public readonly state: ActionResultState<T>;
	public code: ActionResultCode;
	public payload: T;

	constructor(options?: ActionResultOptions<T>) {
		this.state = new ActionResultState(options);
		this.code = ActionResultCode.NOT_SET;

		const parsed = this.parseOptions(options);
		this.payload = parsed.payload as T;
	}

	public parseOptions(options: ActionResultOptions<T> = {}): ActionResultOptions<T> {
		return {
			payload: this.parseOptionsPayload(options)
		};
	}

	public parseOptionsPayload(options: ActionResultOptions<T> = {}): T | undefined {
		let result: T | undefined = undefined;

		if (options.payload) {
			result = options.payload;
		}

		return result;
	}

	public forceFailure(): ActionResult<T> {
		this.code = ActionResultCode.FAILURE;
		return this;
	}

	public forceSuccess(): ActionResult<T> {
		this.code = ActionResultCode.SUCCESS;
		return this;
	}

	public error(error: any): boolean {
		if (Array.isArray(error)) {
			error.forEach(this.error, this);
		} else if (error instanceof Error) {
			this.state.errorLog.push(error);
		} else if (error != null && error.toString) {
			this.state.errorLog.push(Error(error.toString()));
		} else {
			this.state.errorLog.push(Error(JSON.stringify(error)));
		}

		if (!this.isFailure() && this.state.hasFailed()) {
			this.forceFailure();
		}

		return !this.isFailure();
	}

	public message(message: any): ActionResult<T> {
		if (Array.isArray(message)) {
			message.forEach(this.message, this);
		} else if (typeof message === 'string') {
			this.state.messageLog.push(message);
		} else if (message != null && message.toString) {
			this.state.messageLog.push(message.toString());
		} else {
			this.state.messageLog.push(JSON.stringify(message));
		}

		return this;
	}

	public complete(): ActionResult<T> {
		if (this.payload == null) {
			return this.forceFailure();
		}

		if (this.state.hasFailed()) {
			return this.forceFailure();
		}

		return this.forceSuccess();
	}

	public getData(): T | Error[] {
		if (this.complete().isFailure()) {
			return this.state.errorLog;
		}

		return this.payload;
	}

	public isFailure(): boolean {
		return this.code === ActionResultCode.FAILURE;
	}

	public isSuccess(): boolean {
		return this.code === ActionResultCode.SUCCESS;
	}
}
