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

	public error(errors: Error | Error[]): boolean {
		if (!Array.isArray(errors)) {
			this.state.errorLog.push(errors);
		} else {
			errors.forEach((error) => {
				this.state.errorLog.push(error);
			});
		}

		if (!this.isFailure() && this.state.hasFailed()) {
			this.forceFailure();
		}

		return !this.isFailure();
	}

	public message(messages: string | string[]): ActionResult<T> {
		if (!Array.isArray(messages)) {
			this.state.messageLog.push(messages);
		} else {
			messages.forEach((message) => {
				this.state.messageLog.push(message);
			});
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
