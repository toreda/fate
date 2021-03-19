import {ActionResultCode as CODE} from 'src/action-result/code';

export interface AckState<T = unknown> {
	code: CODE;
	errorLog: Error[];
	errorThreshold: number;
	messageLog: string[];
	payload: T | null;
}
