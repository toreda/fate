import {StrongInt, makeInt} from '@toreda/strong-types';

import {json} from '../aliases';
import {parseError, serializeErrors} from '../utility';
import {ActionResultCode} from './code';
import {ActionResultOptions} from './options';

export class ActionResultState<T = unknown> {
	public code: ActionResultCode;
	public readonly errorThreshold: StrongInt;
	public readonly errorLog: Error[];
	public readonly messageLog: string[];
	public payload: T | null;

	constructor(options: ActionResultOptions<T> = {}) {
		this.code = ActionResultCode.NOT_SET;
		this.errorThreshold = makeInt(0, null);
		this.payload = null;

		this.errorLog = [];
		this.messageLog = [];

		if (options.serialized) {
			const json = this.parseJson(options.serialized);

			if (typeof json.code === 'number' && json.code >= -1 && json.code <= 1) {
				this.code = json.code;
			}

			if (Array.isArray(json.errorLog)) {
				this.errorLog = json.errorLog.map((err) => parseError(err));
			}

			if (Array.isArray(json.messageLog)) {
				this.messageLog = json.messageLog;
			}

			if (json.payload != null) {
				this.payload = json.payload as T;
			}

			if (typeof json.errorThreshold === 'number') {
				this.errorThreshold(json.errorThreshold);
			}
		}

		if (typeof options.errorThreshold === 'number') {
			this.errorThreshold(options.errorThreshold);
		}

		if (options.payload != null) {
			this.payload = options.payload;
		}
	}

	public parseJson(json: json): Record<string, unknown> {
		let state: Record<string, unknown>;

		try {
			state = JSON.parse(json);
		} catch (error) {
			state = {};
		}

		return state;
	}

	public serialize(): string {
		const state = {
			code: this.code,
			errorLog: this.errorLog,
			errorThreshold: this.errorThreshold(),
			messageLog: this.messageLog,
			payload: this.payload
		};

		return JSON.stringify(state, serializeErrors);
	}

	public forceFailure(): void {
		this.code = ActionResultCode.FAILURE;
	}

	public forceSuccess(): void {
		this.code = ActionResultCode.SUCCESS;
	}

	public hasFailed(): boolean {
		return this.errorLog.length > this.errorThreshold();
	}
}
