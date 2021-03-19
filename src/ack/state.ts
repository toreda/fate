import {AckCode as CODE} from '../ack/code';

export interface AckState<T = unknown> {
	code: CODE;
	errorLog: Error[];
	errorThreshold: number;
	messageLog: string[];
	payload: T | null;
}
