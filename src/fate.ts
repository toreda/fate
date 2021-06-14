import {jsonType} from '@toreda/types';
import {FateObject} from './fate/object';
import {FateOptions} from './fate/options';

export class Fate<T = unknown> {
	public data: T | null;

	public readonly errorLog: FateObject['errorLog'];
	public readonly messageLog: FateObject['messageLog'];
	public readonly errorThreshold: FateObject['errorThreshold'];

	private _status: FateObject['status'];

	constructor(options: FateOptions<T> = {}) {
		this.data = null;

		this.errorLog = [];
		this.messageLog = [];
		this.errorThreshold = 0;

		this._status = 0;

		if (options.serialized) {
			const state = this.convertStringToJson(options.serialized);

			if (Array.isArray(state)) {
				throw state;
			}

			this.data = state.data;

			this.errorLog = state.errorLog.map(this.parseError);
			this.messageLog = state.messageLog;
			this.errorThreshold = state.errorThreshold;

			this._status = state.status;
		}

		if (options.data) {
			this.data = options.data;
		}

		if (options.errorThreshold != null) {
			this.errorThreshold = options.errorThreshold;
		}
	}

	private convertStringToJson(serialized: string): FateObject<T> | Error[] {
		let result: FateObject<T> | Error[];
		let errors: Error[] = [];

		try {
			const parsed = JSON.parse(serialized);

			if (parsed) {
				errors = this.getStateErrors(parsed);
			}

			if (errors.length || !parsed) {
				throw Error('Serialized Fate is not valid.');
			}

			result = parsed;
		} catch (error) {
			result = [error, ...errors];
		}

		return result;
	}

	private getStateErrors(state: FateObject<T>): Error[] {
		const errors: Error[] = [];

		if (state.errorLog) {
			errors.push(...this.getStateErrorsErrorLog(state.errorLog));
		}
		if (state.messageLog) {
			errors.push(...this.getStateErrorsMessageLog(state.messageLog));
		}

		errors.push(...this.getStateErrorsErrorThreshold(state.errorThreshold));
		errors.push(...this.getStateErrorsStatus(state.status));

		return errors;
	}

	private getStateErrorsErrorThreshold(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || typeof data !== 'number' || data < 0) {
			errors.push(Error('Fate errorThreshold must be 0 or greater.'));
		}

		return errors;
	}

	private getStateErrorsErrorLog(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || !Array.isArray(data)) {
			errors.push(Error('Fate errorLog must be an array.'));
		}

		return errors;
	}

	private getStateErrorsMessageLog(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || !Array.isArray(data)) {
			errors.push(Error('Fate messageLog must be an array.'));
		}

		return errors;
	}

	private getStateErrorsStatus(data: unknown): Error[] {
		const errors: Error[] = [];

		if (data == null || typeof data !== 'number' || data > 1 || data < -1) {
			errors.push(Error('Fate status must be -1, 0, or 1.'));
		}

		return errors;
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

	public error(error: unknown): Fate<T> {
		if (Array.isArray(error)) {
			error.forEach(this.error, this);
		} else if (error instanceof Error) {
			this.errorLog.push(error);
		} else if (this.checkIsToStringable(error)) {
			this.errorLog.push(Error(error.toString()));
		} else {
			this.errorLog.push(Error(JSON.stringify(error)));
		}

		if (this.errorThresholdBreached()) {
			this._status = -1;
		}

		return this;
	}

	public message(message: unknown): Fate<T> {
		if (Array.isArray(message)) {
			message.forEach(this.message, this);
		} else if (typeof message === 'string') {
			this.messageLog.push(message);
		} else if (this.checkIsToStringable(message)) {
			this.messageLog.push(message.toString());
		} else {
			this.messageLog.push(JSON.stringify(message));
		}

		return this;
	}

	public status(): FateObject['status'];
	public status(status: number): void;
	public status(status?: number): FateObject['status'] | void {
		if (!status) {
			return this._status;
		}

		if (typeof status !== 'number') {
			return;
		}

		if (isNaN(status)) {
			return;
		}

		if (status % 1 !== 0) {
			return;
		}

		if (status > 1) {
			return;
		}

		if (status < -1) {
			return;
		}

		this._status = status as FateObject['status'];
	}

	private errorThresholdBreached(): boolean {
		return this.errorLog.length > this.errorThreshold;
	}

	public serialize(includeLogs = true): string {
		const state: Record<string, unknown> = {
			data: this.data,
			errorThreshold: this.errorThreshold,
			status: this._status
		};

		if (includeLogs) {
			state.errorLog = this.errorLog;
			state.messageLog = this.messageLog;
		}

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

	private parseError(jsonObj: jsonType): Error {
		const error = Error();

		error.message = jsonObj.message;
		error.stack = jsonObj.stack;

		return error;
	}
}

type ToStringable = {toString: () => string};
