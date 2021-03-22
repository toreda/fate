import {ToStringable, json} from './aliases';
import {FateCode as CODE} from './fate/code';
import {FateOptions as Options} from './fate/options';
import {FateState as State} from './fate/state';

export class Fate<T = unknown> {
	public readonly state: State<T>;

	constructor(options: Options<T> = {}) {
		const fromSerial = this.parseSerialized(options.serialized);
		const finalState = this.parseOptions(fromSerial, options);

		this.state = finalState;
	}

	private parseSerialized(serialized?: string): State<T> {
		const state = this.getDefaultState();

		if (!serialized || typeof serialized !== 'string') {
			return state;
		}

		const parsed = this.convertStringToJson(serialized);

		if (Array.isArray(parsed)) {
			throw parsed;
		}

		parsed.errorLog = parsed.errorLog.map(this.parseError);

		for (const key in parsed) {
			state[key] = parsed[key];
		}

		return state;
	}

	private getDefaultState(): State<T> {
		return {
			code: CODE.NOT_SET,
			errorLog: [],
			errorThreshold: 0,
			messageLog: [],
			payload: null
		};
	}

	private convertStringToJson(serialized: string): State<T> | Error[] {
		let result: State<T> | Error[];
		let errors: Error[] = [];

		try {
			const parsed = JSON.parse(serialized);

			if (parsed) {
				errors = this.getStateErrors(parsed);
			}

			if (errors.length || !parsed) {
				throw new Error('state is not valid');
			}

			result = parsed;
		} catch (error) {
			result = [error, ...errors];
		}

		return result;
	}

	private getStateErrors(state: State<T>): Error[] {
		const errors: Error[] = [];

		errors.push(...this.getStateErrorsCode(state.code));
		errors.push(...this.getStateErrorsErrorThreshold(state.errorThreshold));
		errors.push(...this.getStateErrorsErrorLog(state.errorLog));
		errors.push(...this.getStateErrorsMessageLog(state.messageLog));

		return errors;
	}

	private getStateErrorsCode(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || typeof data !== 'number' || data > 1 || data < -1) {
			errors.push(Error('code must be -1, 0, or 1.'));
		}

		return errors;
	}

	private getStateErrorsErrorThreshold(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || typeof data !== 'number' || data < 0) {
			errors.push(Error('errorThreshold must be 0 or greater.'));
		}

		return errors;
	}

	private getStateErrorsErrorLog(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || !Array.isArray(data)) {
			errors.push(Error('errorLog must be an array.'));
		}

		return errors;
	}

	private getStateErrorsMessageLog(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || !Array.isArray(data)) {
			errors.push(Error('messageLog must be an array.'));
		}

		return errors;
	}

	private parseError(jsonObj: json): Error {
		const error = Error();

		error.message = jsonObj.message;
		error.stack = jsonObj.stack;

		return error;
	}

	private parseOptions(stateArg: State<T>, options: Options<T>): State<T> {
		const state: State<T> = stateArg;

		const errors: Error[] = [];

		if (options.errorThreshold != null) {
			const e = this.getStateErrorsErrorThreshold(options.errorThreshold);

			if (e.length) {
				errors.push(...e);
			} else {
				state.errorThreshold = options.errorThreshold;
			}
		}

		if (options.payload != null) {
			state.payload = options.payload;
		}

		if (errors.length) {
			throw errors;
		}

		return state;
	}

	public error(error: unknown): Fate<T> {
		if (Array.isArray(error)) {
			error.forEach(this.error, this);
		} else if (error instanceof Error) {
			this.state.errorLog.push(error);
		} else if (this.checkIsToStringable(error)) {
			this.state.errorLog.push(Error(error.toString()));
		} else {
			this.state.errorLog.push(Error(JSON.stringify(error)));
		}

		if (this.errorThresholdBreached()) {
			this.forceFailure();
		}

		return this;
	}

	public message(message: unknown): Fate<T> {
		if (Array.isArray(message)) {
			message.forEach(this.message, this);
		} else if (typeof message === 'string') {
			this.state.messageLog.push(message);
		} else if (this.checkIsToStringable(message)) {
			this.state.messageLog.push(message.toString());
		} else {
			this.state.messageLog.push(JSON.stringify(message));
		}

		return this;
	}

	private checkIsToStringable(mightBeToStringable: unknown): mightBeToStringable is ToStringable {
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

	public isFailure(): boolean {
		return this.calculateCode() === CODE.FAILURE;
	}

	public isSuccess(): boolean {
		return this.calculateCode() === CODE.SUCCESS;
	}

	private calculateCode(): CODE {
		if (this.errorThresholdBreached()) {
			return this.forceFailure();
		}

		if (this.state.payload != null) {
			return this.forceSuccess();
		}

		return this.state.code;
	}

	private errorThresholdBreached(): boolean {
		return this.state.errorLog.length > this.state.errorThreshold;
	}

	private forceFailure(): CODE.FAILURE {
		this.state.code = CODE.FAILURE;
		return this.state.code;
	}

	private forceSuccess(): CODE.SUCCESS {
		this.state.code = CODE.SUCCESS;
		return this.state.code;
	}

	public getData(): T | Error[] {
		if (this.isFailure()) {
			return this.state.errorLog;
		}

		if (this.state.payload == null) {
			return [Error('Payload is null.')];
		}

		return this.state.payload;
	}

	public serialize(): string {
		const state = {
			code: this.state.code,
			errorLog: this.state.errorLog,
			errorThreshold: this.state.errorThreshold,
			messageLog: this.state.messageLog,
			payload: this.state.payload
		};

		return JSON.stringify(state, this.serializeErrors);
	}

	private serializeErrors(_key: string, errors: unknown): unknown {
		if (!Array.isArray(errors) || errors.length === 0) {
			return errors;
		}

		if (!(errors[0] instanceof Error)) {
			return errors;
		}

		const list: unknown[] = [];

		for (const error of errors) {
			const asString = {};

			Object.getOwnPropertyNames(error).forEach(function (key) {
				asString[key] = error[key];
			});

			list.push(asString);
		}

		return list;
	}
}
