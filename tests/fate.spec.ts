import {Fate} from '../src/fate';
import {typeMatch} from '@toreda/strong-types';

describe('Fate', () => {
	const instance = new Fate();
	const options = {
		data: 'mock payload',
		errorLog: [Error('Mock Error')],
		errorThreshold: 99,
		messageLog: ['Mock Message'],
		status: 1
	};
	const serialized = JSON.stringify(options, instance['serializeErrors']);

	afterEach(() => {
		instance.status(0);
		instance.errorLog.length = 0;
		Object.defineProperty(instance, 'errorThreshold', {value: Infinity});
		instance.messageLog.length = 0;
		instance.data = null;
	});

	describe('Construction', () => {
		it('should not throw with no args', () => {
			expect(() => {
				new Fate();
			}).not.toThrow();
		});

		it('should intialize code to 0', () => {
			const custom = new Fate();

			expect(custom.status()).toBe(0);
		});

		it('should initialize errorCode to empty string', () => {
			const custom = new Fate();
			expect(custom.errorCode()).toBe('');
		});

		it('should initialize status to 0', () => {
			const custom = new Fate();
			expect(custom.status()).toBe(0);
		});

		it('should intialize errorThreshold to 0', () => {
			const custom = new Fate();

			expect(custom.errorThreshold).toBe(0);
		});

		it('should intialize errorLog to []', () => {
			const custom = new Fate();

			expect(custom.errorLog).toEqual([]);
		});

		it('should intialize messageLog to []', () => {
			const custom = new Fate();

			expect(custom.messageLog).toEqual([]);
		});

		it('should intialize data to null', () => {
			const custom = new Fate();

			expect(custom.data).toBeNull();
		});

		it('should use serialized options to init', () => {
			const custom = new Fate({serialized});

			expect(custom.data).toStrictEqual(options.data);
			expect(custom.errorLog).toStrictEqual(options.errorLog);
			expect(custom.errorThreshold).toBe(options.errorThreshold);
			expect(custom.messageLog).toStrictEqual(options.messageLog);
			expect(custom.status()).toBe(options.status);
		});

		it('should prioritize defined options over serialized', () => {
			const errorThreshold = options.errorThreshold * 2;
			const data = options.data + ' direct';

			const custom = new Fate({serialized, errorThreshold, data});

			expect(custom.status()).toBe(options.status);
			expect(custom.errorLog).toStrictEqual(options.errorLog);
			expect(custom.messageLog).toStrictEqual(options.messageLog);

			expect(custom.errorThreshold).toBe(errorThreshold);
			expect(custom.data).toStrictEqual(data);
		});

		it('should throw when serialized has flaws', () => {
			expect(() => {
				const result = new Fate({serialized: 'null'});
				console.log(result);
			}).toThrow();

			expect(() => {
				const result = new Fate({serialized: 'in{valid'});
				console.log(result);
			}).toThrow();

			expect(() => {
				const result = new Fate({serialized: '{"errorThreshold": -1}'});
				console.log(result);
			}).toThrow();
		});
	});

	describe.each(['Error', 'Message'])('Adding %ss', (name) => {
		const func = name.toLowerCase();
		const log = `${func}Log`;

		it(`should add single ${func} to ${log}`, () => {
			expect(instance[log].length).toBe(0);
			let counter = 0;

			while (counter < 5) {
				counter++;
				instance[func](`new ${func} ${counter}`);
				expect(instance[log].length).toBe(counter);
			}
		});

		it(`should add multiple ${func}s to ${log}`, () => {
			expect(instance[log].length).toBe(0);

			const customlog = ['string test', 918230, {key: 'value'}, null, Error('error message')];

			instance[func](customlog);
			expect(instance[log].length).toBe(customlog.length);
		});
	});

	describe('Adding Errors', () => {
		it('should change success to false if threshold is reached', () => {
			Object.defineProperty(instance, 'errorThreshold', {value: 0});
			instance.success(true);

			instance.error('forces failure');

			expect(instance.success()).toBe(false);
		});
	});

	describe('Serialize', () => {
		it('should return a string', () => {
			expect(typeof instance.serialize()).toBe('string');
		});

		it('should return a json object with all properties', () => {
			const custom = new Fate({errorThreshold: 33});
			custom.status(-1);
			custom.errorLog.push(Error('mock error toserialize'));
			custom.messageLog.push('mock message toserialize');
			custom.data = options.data + ' toserialize';

			const result = custom.serialize();

			expect(result).toMatch('status');
			expect(result).toMatch('errorLog');
			expect(result).toMatch('errorThreshold');
			expect(result).toMatch('messageLog');
			expect(result).toMatch('data');
		});
	});

	describe('Helper Functions', () => {
		beforeEach(() => {
			instance.status.reset();
			instance.done.reset();
		});

		describe(`setDone`, () => {
			it(`should set done to true when calling setDone with no arg`, () => {
				instance.done(false);
				expect(instance.done()).toBe(false);
				instance.setDone();
				expect(instance.done()).toBe(true);
			});

			it(`should set done true when calling setDone with true`, () => {
				instance.done(false);
				expect(instance.done()).toBe(false);
				instance.setDone(true);
				expect(instance.done()).toBe(true);
			});

			it(`should set done true when calling setDone with false`, () => {
				instance.done(true);
				expect(instance.done()).toBe(true);
				instance.setDone(false);
				expect(instance.done()).toBe(false);
			});

			it(`should set success to false if errorThreshold has been breached`, () => {
				instance.success(true);
				expect(instance.success()).toBe(true);
				instance.error('error');
				const errorThreshold = instance.errorThreshold;
				(instance.errorThreshold as any) = 0;
				instance.setDone(false);
				expect(instance.success()).toBe(false);
				instance.errorLog.length = 0;
				(instance.errorThreshold as any) = errorThreshold;
			});

			it(`should set success to true if errorThreshold has not been breached`, () => {
				instance.success(false);
				expect(instance.success()).toBe(false);
				instance.setDone(false);
				expect(instance.success()).toBe(true);
			});

			it(`should return fate instance when called`, () => {
				const result = instance.setDone();
				expect(typeMatch(result, Fate)).toBe(true);
				expect(result).toBe(instance);
			});
		});

		describe(`setErrorCode`, () => {
			it(`should set error code when calling setErrorCode`, () => {
				const sampleCode = 'E_EEEEE';
				expect(instance.status()).toBe(0);
				instance.setErrorCode(sampleCode);
				expect(instance.errorCode()).toBe(sampleCode);
			});

			it(`should set done true when calling setErrorCode with a string`, () => {
				const sampleCode = 'E_141414';
				expect(instance.done()).toBe(false);
				instance.setErrorCode(sampleCode);
				expect(instance.done()).toBe(true);
			});

			it(`should return fate instance when calling setErrorCode with a string`, () => {
				const result = instance.setErrorCode('DD3_149711947');
				expect(typeMatch(result, Fate)).toBe(true);
				expect(result).toBe(instance);
			});

			it(`should return fate instance when calling setErrorCode with undefined`, () => {
				const result = instance.setErrorCode(undefined as any);
				expect(typeMatch(result, Fate)).toBe(true);
				expect(result).toBe(instance);
			});

			it(`should return fate instance when calling setErrorCode with null`, () => {
				const result = instance.setErrorCode(null as any);
				expect(typeMatch(result, Fate)).toBe(true);
				expect(result).toBe(instance);
			});

			it(`should return fate instance when calling setErrorCode with a truthy non-number`, () => {
				const result = instance.setErrorCode(['aa'] as any);
				expect(typeMatch(result, Fate)).toBe(true);
				expect(result).toBe(instance);
			});

			it(`should return fate instance when calling setErrorCode with a falsey non-number`, () => {
				const result = instance.setErrorCode('' as any);
				expect(typeMatch(result, Fate)).toBe(true);
				expect(result).toBe(instance);
			});
		});

		describe(`setSuccess`, () => {
			it(`should set success to true when calling setSuccess with no arg`, () => {
				instance.success(false);
				expect(instance.success()).toBe(false);
				instance.setSuccess();
				expect(instance.success()).toBe(true);
			});

			it(`should set success to true when calling setSuccess with true`, () => {
				instance.success(false);
				expect(instance.success()).toBe(false);
				instance.setSuccess(true);
				expect(instance.success()).toBe(true);
			});

			it(`should set success to false when calling setSuccess with false`, () => {
				instance.success(true);
				expect(instance.success()).toBe(true);
				instance.setSuccess(false);
				expect(instance.success()).toBe(false);
			});

			it(`should set done to true when calling setSuccess`, () => {
				instance.done(false);
				expect(instance.done()).toBe(false);
				instance.setSuccess();
				expect(instance.done()).toBe(true);
			});

			it(`should return fate instance when called`, () => {
				const result = instance.setSuccess();
				expect(typeMatch(result, Fate)).toBe(true);
				expect(result).toBe(instance);
			});
		});

		describe(`isDoneAndFailed`, () => {
			it(`should return false when done is false`, () => {
				instance.done(false);
				expect(instance.done()).toBe(false);
				const result = instance.isDoneAndFailed();
				expect(result).toBe(false);
			});

			it(`should return false when success is true`, () => {
				instance.done(true);
				expect(instance.done()).toBe(true);
				instance.success(true);
				expect(instance.success()).toBe(true);
				const result = instance.isDoneAndFailed();
				expect(result).toBe(false);
			});

			it(`should return true done is true and success is false`, () => {
				instance.done(true);
				expect(instance.done()).toBe(true);
				instance.success(false);
				expect(instance.success()).toBe(false);
				const result = instance.isDoneAndFailed();
				expect(result).toBe(true);
			});
		});

		describe(`isDoneAndSucceeded`, () => {
			it(`should return false when done is false`, () => {
				instance.done(false);
				expect(instance.done()).toBe(false);
				const result = instance.isDoneAndSucceeded();
				expect(result).toBe(false);
			});

			it(`should return false when success is false`, () => {
				instance.done(true);
				expect(instance.done()).toBe(true);
				instance.success(false);
				expect(instance.success()).toBe(false);
				const result = instance.isDoneAndSucceeded();
				expect(result).toBe(false);
			});

			it(`should return true done is true and success is false`, () => {
				instance.done(true);
				expect(instance.done()).toBe(true);
				instance.success(true);
				expect(instance.success()).toBe(true);
				const result = instance.isDoneAndSucceeded();
				expect(result).toBe(true);
			});
		});
	});

	describe('Reset', () => {
		it('should reset errorCode', () => {
			const code = 'AAA9174';
			instance.errorCode(code);
			expect(instance.errorCode()).toBe(code);
			instance.reset();
			expect(instance.errorCode()).toBe('');
		});

		it('should reset errorCode when already has initial value', () => {
			const code = '';
			instance.errorCode(code);
			expect(instance.errorCode()).toBe(code);
			instance.reset();
			expect(instance.errorCode()).toBe('');
		});

		it('should reset data', () => {
			instance.data = {aaa: 141};
			instance.reset();
			expect(instance.data).toBeNull();
		});

		it('should reset done', () => {
			instance.done(true);
			expect(instance.done()).toBe(true);
			instance.reset();
			expect(instance.done()).toBe(false);
		});

		it('should reset done when done has initial value', () => {
			instance.done(false);
			expect(instance.done()).toBe(false);
			instance.reset();
			expect(instance.done()).toBe(false);
		});

		it('should reset success', () => {
			instance.success(true);
			expect(instance.success()).toBe(true);
			instance.reset();
			expect(instance.success()).toBe(false);
		});

		it('should reset success when success has initial value', () => {
			instance.success(false);
			expect(instance.success()).toBe(false);
			instance.reset();
			expect(instance.success()).toBe(false);
		});

		it('should reset messageLog array to an empty array', () => {
			instance.messageLog.push('aaa', 'bbb', 'ccc');
			expect(instance.messageLog.length).toBe(3);
			instance.reset();
			expect(instance.messageLog.length).toBe(0);
		});

		it('should reset errorLog array to an empty array', () => {
			instance.errorLog.push(new Error('aaa'), new Error('bbb'));
			expect(instance.errorLog.length).toBe(2);
			instance.reset();
			expect(instance.errorLog.length).toBe(0);
		});

		it('should reset status', () => {
			instance.status(201);
			expect(instance.status()).toBe(201);
			instance.reset();
			expect(instance.status()).toBe(0);
		});

		it('should reset status when status already has initial value', () => {
			instance.status(0);
			expect(instance.status()).toBe(0);
			instance.reset();
			expect(instance.status()).toBe(0);
		});
	});

	describe(`Getting Errors`, () => {
		beforeEach(() => {
			instance.error('Error 1');
			instance.error('Error 2');
			instance.error('Error 3');
			instance.error('Error 4');
		});

		it(`should return array of errors if fullTrace is true`, () => {
			const errors = instance.getErrors(true);

			expect(Array.isArray(errors)).toBe(true);

			errors.forEach((err) => {
				expect(err).toBeInstanceOf(Error);
			});
		});

		it(`should return array of strings if fullTrace is false`, () => {
			const errors = instance.getErrors(false);

			expect(Array.isArray(errors)).toBe(true);

			errors.forEach((err) => {
				expect(typeof err).toBe('string');
			});
		});

		it(`should return array of strings if fullTrace is not provided`, () => {
			const errors = instance.getErrors();

			expect(Array.isArray(errors)).toBe(true);

			errors.forEach((err) => {
				expect(typeof err).toBe('string');
			});
		});
	});

	describe('Visual Confirmation Error', () => {
		it('single error', () => {
			const testData = Error('regular err');
			const expectedResult = [testData];

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('single string', () => {
			const testData = 'radio';
			const expectedResult = [Error(testData)];

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('single number', () => {
			const testData = 846891;
			const expectedResult = [Error(testData.toString())];

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('array of errors', () => {
			const testData = [Error('the'), Error('spanish'), Error('inquisition')];
			const expectedResult = testData;

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('array of strings', () => {
			const testData = ['orange', 'turtle', 'scuba'];
			const expectedResult = testData.map((d) => Error(d));

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('array of arrays', () => {
			const testData: any = [[123890, 983249], [198230], [729478], [705323, 491841, 987215]];
			const expectedResult = testData.flat().map((d) => Error(d.toString()));

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('nested object', () => {
			const testData = {idProp: 'random id', complicated: {artist: 'avril lavigne'}};
			const expectedResult = [Error(JSON.stringify(testData))];

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('custom object with non function toString prop', () => {
			const testData = {toString: 'not a function'};
			const expectedResult = [Error(JSON.stringify(testData))];

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('custom object with custom toString function', () => {
			const testData = {randomData: 'could be anything'};
			testData.toString = () => `this.randomData = "${testData.randomData}"}`;

			const expectedResult = [Error(testData.toString())];

			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});

		it('repeated calls', () => {
			let testData: any;
			const expectedResult: any[] = [];

			testData = Error('failure to communicate');
			expectedResult.push(testData);
			instance.error(testData);

			testData = 'banana';
			expectedResult.push(Error(testData));
			instance.error(testData);

			testData = 728934;
			expectedResult.push(Error(testData.toString()));
			instance.error(testData);

			testData = [Error('elf'), Error('on'), Error('the'), Error('shelf')];
			testData.forEach((d) => expectedResult.push(d));
			instance.error(testData);

			testData = ['pirates', 'of', 'the', 'caribbean'];
			testData.forEach((d) => expectedResult.push(Error(d)));
			instance.error(testData);

			testData = [1, [2], [3, 4], [5, [6, 7], 8], 9];
			testData.flat(Infinity).forEach((d) => expectedResult.push(Error(d.toString())));
			instance.error(testData);

			testData = new Fate<string>({data: 'great expectations'});
			expectedResult.push(Error(JSON.stringify(testData)));
			instance.error(testData);

			expect(instance.errorLog).toStrictEqual(expectedResult);
		});
	});

	describe('Visual Confirmation Message', () => {
		it('single string', () => {
			const testData = 'spice';
			const expectedResult = [testData];

			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});

		it('single number', () => {
			const testData = 846891;
			const expectedResult = [testData.toString()];

			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});

		it('array of strings', () => {
			const testData = ['zesty', 'lemon', 'drink'];
			const expectedResult = testData;

			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});

		it('array of arrays', () => {
			const testData: any = [[123890, 983249], [198230], [729478], [705323, 491841, 987215]];
			const expectedResult = testData.flat().map((d) => d.toString());

			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});

		it('nested object', () => {
			const testData = {unique: 'identification', complex: {linear: 'algebra'}};
			const expectedResult = [JSON.stringify(testData)];

			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});

		it('custom object with non function toString prop', () => {
			const testData = {toString: 'not what you expect'};
			const expectedResult = [JSON.stringify(testData)];

			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});

		it('custom object with custom toString function', () => {
			const testData = {randomData: 'here is the stuff'};
			testData.toString = () => `this.randomData = "${testData.randomData}"}`;
			const expectedResult = [testData.toString()];

			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});

		it('repeated calls', () => {
			let testData: any;
			const expectedResult: any[] = [];

			testData = 'golden ticket';
			expectedResult.push(testData);
			instance.message(testData);

			testData = 849562;
			expectedResult.push(testData.toString());
			instance.message(testData);

			testData = ["what's", 'in', 'the', 'box'];
			testData.forEach((d) => expectedResult.push(d));
			instance.message(testData);

			testData = [[9], 8, [7, 6, [5, 4, [3]]], [2, 1]];
			testData.flat(Infinity).forEach((d) => expectedResult.push(d.toString()));
			instance.message(testData);

			testData = new Fate<string>({data: 'lord of the flies'});
			expectedResult.push(JSON.stringify(testData));
			instance.message(testData);

			expect(instance.messageLog).toStrictEqual(expectedResult);
		});
	});
});
