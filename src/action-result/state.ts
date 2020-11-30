import {StrongInt, StrongMap, makeInt} from '@toreda/strong-types';

import {ActionResultOptions} from './options';

export class ActionResultState<T> extends StrongMap {
	public readonly errorThreshold: StrongInt;
	public readonly errorLog: Error[];
	public readonly messageLog: string[];

	constructor(options: ActionResultOptions<T> = {}) {
		super();

		this.errorLog = [];
		this.errorThreshold = makeInt(null, 0);
		this.messageLog = [];

		this.parse(options);
	}

	public hasFailed(): boolean {
		return this.errorLog.length > this.errorThreshold();
	}
}
