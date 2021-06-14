export type FateObject<T = unknown> = {
	data: T;
	errorThreshold: number;
	errorLog: Error[];
	messageLog: string[];
	status: -1 | 0 | 1;
};
