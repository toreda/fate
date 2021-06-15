export type FateObject<T = unknown> = {
	data: T;
	errorCode: string;
	errorLog: Error[];
	errorThreshold: number;
	messageLog: string[];
	status: number;
	success: boolean;
	executed: boolean;
};
