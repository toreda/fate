import {Fate} from '../fate';

export class FateChain<T> {
	public readonly fate: Fate<T>;

	constructor(fate: Fate<T>) {
		this.fate = fate;
	}

	public pass(): FateChain<T> {
		this.fate.success(true);

		return this;
	}

	public fail(): FateChain<T> {
		this.fate.success(false);

		return this;
	}

	public success(): FateChain<T> {
		this.fate.success(true);

		return this;
	}

	public done(): void {
		this.fate.done(true);
	}
}
