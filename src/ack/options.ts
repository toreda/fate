export interface AckOptions<T = unknown> {
	errorThreshold?: number;
	payload?: T;
	serialized?: string;
}
