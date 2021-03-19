import {ActionResultState} from 'src/action-result/state';
import {serializeErrors} from 'src/utility';

describe('ActionResultState', () => {
	const instance = new ActionResultState();
	const options = {
		code: 1,
		errorLog: [Error('Mock Error')],
		errorThreshold: 99,
		messageLog: ['Mock Message'],
		payload: 'mock payload'
	};
	const serialized = JSON.stringify(options, serializeErrors);

	describe('constructor', () => {
		it('should intialize code to 0', () => {
			expect(instance.code).toBe(0);
		});

		it('should intialize errorThreshold to 0', () => {
			expect(instance.errorThreshold()).toBe(0);
		});

		it('should intialize errorLog to []', () => {
			expect(instance.errorLog).toEqual([]);
		});

		it('should intialize messageLog to []', () => {
			expect(instance.messageLog).toEqual([]);
		});

		it('should intialize payload to null', () => {
			expect(instance.payload).toBeNull();
		});

		it('should use serialized options to init', () => {
			const custom = new ActionResultState({serialized});

			expect(custom.code).toBe(options.code);
			expect(custom.errorLog).toStrictEqual(options.errorLog);
			expect(custom.errorThreshold()).toBe(options.errorThreshold);
			expect(custom.messageLog).toStrictEqual(options.messageLog);
			expect(custom.payload).toStrictEqual(options.payload);
		});

		it('should prioritize defined options over serialized', () => {
			const errorThreshold = options.errorThreshold * 2;
			const payload = options.payload + ' direct';

			const custom = new ActionResultState({serialized, errorThreshold, payload});

			expect(custom.code).toBe(options.code);
			expect(custom.errorLog).toStrictEqual(options.errorLog);
			expect(custom.messageLog).toStrictEqual(options.messageLog);

			expect(custom.errorThreshold()).toBe(errorThreshold);
			expect(custom.payload).toStrictEqual(payload);
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

	describe('serialize', () => {
		it('should return a json object with all properties', () => {
			const custom = new ActionResultState({errorThreshold: 33});
			custom.code = -1;
			custom.errorLog.push(Error('mock error toserialize'));
			custom.messageLog.push('mock message toserialize');
			custom.payload = options.payload + ' toserialize';

			const result = custom.serialize();

			expect(result).toMatch('code');
			expect(result).toMatch('errorLog');
			expect(result).toMatch('errorThreshold');
			expect(result).toMatch('messageLog');
			expect(result).toMatch('payload');
		});
	});
});
