import {ActionResultOptions} from './options';
import {ActionResultStateFailure} from './state/failure';

export class ActionResultState {
	public readonly errors: Error[];
	public failOnError: {
		enabled: boolean;
		threshold: number;
	};
	public messages: string[];

	constructor(options?: ActionResultOptions) {
		this.errors = [];
		this.messages = [];
		this.failOnError = this.parseFailOnError(options);
	}

	public hasFailed(): boolean {
		const errCount = this.errors.length;
		if (!errCount) {
			return false;
		}

		if (!this.failOnError.enabled) {
			return false;
		}

		return errCount >= this.failOnError.threshold;
	}

	public parseFailOnError(options?: ActionResultOptions): ActionResultStateFailure {
		const defaultThreshold = 1;

		const defaultValue: ActionResultStateFailure = {
			enabled: false,
			threshold: defaultThreshold
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

		const failOnError: ActionResultStateFailure = {
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
