import {AckCode as CODE} from 'src/ack/code';

export interface AckState<T = unknown> {
	code: CODE;
	errorLog: Error[];
	errorThreshold: number;
	messageLog: string[];
	payload: T | null;
}
