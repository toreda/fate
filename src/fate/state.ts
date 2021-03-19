import {FateCode as CODE} from './code';

export interface FateState<T = unknown> {
	code: CODE;
	errorLog: Error[];
	errorThreshold: number;
	messageLog: string[];
	payload: T | null;
}
