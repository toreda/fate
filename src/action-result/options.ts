export interface ActionResultOptions<T = unknown> {
	errorThreshold?: number;
	payload?: T;
	serialized?: string;
}
