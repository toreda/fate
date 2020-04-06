import {ArmorActionResultOptions} from './options';

export class ArmorActionResultState {
	public readonly errors: Error[];
	public failOnError: {
		enabled: boolean;
		threshold: number;
	};
	public messages: string[];

	constructor(options?: ArmorActionResultOptions) {
		this.errors = [];
		this.messages = [];
		this.failOnError = this.parseFailOnError(options);
	}

	public hasFailed(): boolean {
		const errCount = this.errors.length;
		if (errCount) {
			return false;
		}

		if (!this.failOnError.enabled) {
			return false;
		}

		return errCount >= this.failOnError.threshold;
	}

	public parseFailOnError(options?: ArmorActionResultOptions): any {
		const defaultThreshold = 1;

		const defaultValue = {
			enabled: false,
			threshold: 0
		};

		if (!options) {
			return defaultValue;
		}

		if (!options.failOnError) {
			return defaultValue;
		}

		if (typeof options.failOnError.enabled !== 'boolean') {
			return defaultValue;
		}

		const failOnError = {
			enabled: options.failOnError.enabled,
			threshold: defaultThreshold
		};

		if (typeof options.failOnError.threshold === 'number') {
			failOnError.threshold = options.failOnError.threshold;
		} else if (typeof options.failOnError.threshold === 'string') {
			const parsed = parseInt(options.failOnError.threshold);
			if (!isNaN(parsed)) {
				failOnError.threshold = parsed;
			}
		}

		return failOnError;
	}
}
