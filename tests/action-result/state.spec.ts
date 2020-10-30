import {ActionResultState} from '../../src/action-result/state';

describe('ActionResultState', () => {
	let instance: ActionResultState<unknown>;

	beforeAll(() => {
		instance = new ActionResultState();
	});

	describe('constructor', () => {
		it('should call parse with options', () => {
			const spy = jest.spyOn(ActionResultState.prototype, 'parse');
			const expectedV = {errorThreshold: 10};
			new ActionResultState(expectedV);
			expect(spy).toBeCalledWith(expectedV);
		});

		it('should intialize errorLog to []', () => {
			expect(instance.errorLog).toEqual([]);
		});

		it('should intialize messageLog to []', () => {
			expect(instance.messageLog).toEqual([]);
		});

		it('should intialize errorThreshold to 0', () => {
			expect(instance.errorThreshold()).toBe(0);
		});
	});

	describe('hasFailed', () => {
		const VALUES = [0, 1, 9];
		const TESTS = VALUES.map((v1) => {
			return VALUES.map((v2) => {
				return [v1, v2];
			}).concat([[v1, Infinity]]);
		}).reduce((curr, set) => {
			return curr.concat(set);
		}, []);

		it.each(TESTS)('errorLog.length == %p && errorThreshold == %p', (length, threshold) => {
			instance.errorLog.length = length;
			jest.spyOn(instance, 'errorThreshold').mockReturnValue(threshold);
			expect(instance.hasFailed()).toBe(length > threshold);
		});
	});
});
