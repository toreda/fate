import {Fate} from 'src/fate';
import {FateCode as CODE} from 'src/fate/code';

describe('Fate', () => {
	const instance = new Fate();
	const options = {
		code: 1,
		errorLog: [Error('Mock Error')],
		errorThreshold: 99,
		messageLog: ['Mock Message'],
		payload: 'mock payload'
	};
	const serialized = JSON.stringify(options, instance['serializeErrors']);

	afterEach(() => {
		instance.state.code = CODE.NOT_SET;
		instance.state.errorLog.length = 0;
		instance.state.errorThreshold = Infinity;
		instance.state.messageLog.length = 0;
		instance.state.payload = null;
	});

	describe('INSTANTIATION', () => {
		it('should not throw with no args', () => {
			expect(() => {
				new Fate();
			}).not.toThrow();
		});

		it('should intialize code to 0', () => {
			const custom = new Fate();

			expect(custom.state.code).toBe(0);
		});

		it('should intialize errorThreshold to 0', () => {
			const custom = new Fate();

			expect(custom.state.errorThreshold).toBe(0);
		});

		it('should intialize errorLog to []', () => {
			const custom = new Fate();

			expect(custom.state.errorLog).toEqual([]);
		});

		it('should intialize messageLog to []', () => {
			const custom = new Fate();

			expect(custom.state.messageLog).toEqual([]);
		});

		it('should intialize payload to null', () => {
			const custom = new Fate();

			expect(custom.state.payload).toBeNull();
		});

		it('should use serialized options to init', () => {
			const custom = new Fate({serialized});

			expect(custom.state.code).toBe(options.code);
			expect(custom.state.errorLog).toStrictEqual(options.errorLog);
			expect(custom.state.errorThreshold).toBe(options.errorThreshold);
			expect(custom.state.messageLog).toStrictEqual(options.messageLog);
			expect(custom.state.payload).toStrictEqual(options.payload);
		});

		it('should prioritize defined options over serialized', () => {
			const errorThreshold = options.errorThreshold * 2;
			const payload = options.payload + ' direct';

			const custom = new Fate({serialized, errorThreshold, payload});

			expect(custom.state.code).toBe(options.code);
			expect(custom.state.errorLog).toStrictEqual(options.errorLog);
			expect(custom.state.messageLog).toStrictEqual(options.messageLog);

			expect(custom.state.errorThreshold).toBe(errorThreshold);
			expect(custom.state.payload).toStrictEqual(payload);
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

		it('should throw when options has flaws', () => {
			expect(() => {
				const result = new Fate({errorThreshold: -1});
				console.log(result);
			}).toThrow();
		});
	});

	describe.each(['ERROR', 'MESSAGE'])('ADDING %sS', (name) => {
		const func = name.toLowerCase();
		const log = `${func}Log`;

		it(`should add single ${func} to ${log}`, () => {
			expect(instance.state[log].length).toBe(0);
			let counter = 0;

			while (counter < 5) {
				counter++;
				instance[func](`new ${func} ${counter}`);
				expect(instance.state[log].length).toBe(counter);
			}
		});

		it(`should add multiple ${func}s to ${log}`, () => {
			expect(instance.state[log].length).toBe(0);

			const customlog = ['string test', 918230, {key: 'value'}, null, Error('error message')];

			instance[func](customlog);
			expect(instance.state[log].length).toBe(customlog.length);
		});
	});

	describe('ADDING ERRORS', () => {
		it('should change code to FAILURE if threshold is reached', () => {
			instance.state.errorThreshold = 0;
			expect(instance.state.code).toBe(CODE.NOT_SET);

			instance.error('forces failure');

			expect(instance.state.code).toBe(CODE.FAILURE);
		});
	});

	describe('GET CODE STATUS', () => {
		describe.each([
			['isFailure', 'FAILURE'],
			['isSuccess', 'SUCCESS']
		])('%s', (description, descriptionCode) => {
			it.each([
				[descriptionCode === 'NOT_SET', 'NOT_SET'],
				[descriptionCode === 'SUCCESS', 'SUCCESS'],
				[descriptionCode === 'FAILURE', 'FAILURE']
			])('should return %p when code is %s', (expectedV, testCode) => {
				instance.state.code = CODE[testCode];
				expect(instance[description]()).toBe(expectedV);
			});

			it('should compare to FAILURE when errorThreshold is reached', () => {
				instance.state.errorThreshold = 0;
				instance.error('first error');

				expect(instance[description]()).toBe(descriptionCode === 'FAILURE');
			});

			it('should compare to SUCCESS when payload is not null', () => {
				instance.state.payload = 0;

				expect(instance[description]()).toBe(descriptionCode === 'SUCCESS');
			});
		});
	});

	describe('GET RESULT', () => {
		it('should return the errors if code is FAILURE', () => {
			const spy = jest.spyOn(instance, 'isFailure').mockReturnValue(true);

			expect(instance.getData()).toBe(instance.state.errorLog);
			instance.error(Error('getData 47859'));
			expect(instance.getData()).toBe(instance.state.errorLog);
			instance.error(Error('getData 75168'));
			expect(instance.getData()).toBe(instance.state.errorLog);
			instance.error(Error('getData 23890'));
			expect(instance.getData()).toBe(instance.state.errorLog);

			spy.mockRestore();
		});

		it('should return an error if payload is null', () => {
			const spy = jest.spyOn(instance, 'isFailure').mockReturnValue(false);
			instance.state.payload = null;

			expect(instance.getData()).toStrictEqual([Error('Payload is null.')]);

			spy.mockRestore();
		});

		it('should return the payload if it is not null', () => {
			const spy = jest.spyOn(instance, 'isFailure').mockReturnValue(false);
			instance.state.payload = 'success payload';

			expect(instance.getData()).toBe(instance.state.payload);

			spy.mockRestore();
		});
	});

	describe('SERIALIZE', () => {
		it('should return a string', () => {
			expect(typeof instance.serialize()).toBe('string');
		});

		it('should return a json object with all properties', () => {
			const custom = new Fate({errorThreshold: 33});
			custom.state.code = -1;
			custom.state.errorLog.push(Error('mock error toserialize'));
			custom.state.messageLog.push('mock message toserialize');
			custom.state.payload = options.payload + ' toserialize';

			const result = custom.serialize();

			expect(result).toMatch('code');
			expect(result).toMatch('errorLog');
			expect(result).toMatch('errorThreshold');
			expect(result).toMatch('messageLog');
			expect(result).toMatch('payload');
		});
	});

	describe('Visual Confirmation Error', () => {
		it('single error', () => {
			const testData = Error('regular err');
			const expectedResult = [testData];

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('single string', () => {
			const testData = 'radio';
			const expectedResult = [Error(testData)];

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('single number', () => {
			const testData = 846891;
			const expectedResult = [Error(testData.toString())];

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('array of errors', () => {
			const testData = [Error('the'), Error('spanish'), Error('inquisition')];
			const expectedResult = testData;

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('array of strings', () => {
			const testData = ['orange', 'turtle', 'scuba'];
			const expectedResult = testData.map((d) => Error(d));

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('array of arrays', () => {
			const testData: any = [[123890, 983249], [198230], [729478], [705323, 491841, 987215]];
			const expectedResult = testData.flat().map((d) => Error(d.toString()));

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('nested object', () => {
			const testData = {idProp: 'random id', complicated: {artist: 'avril lavigne'}};
			const expectedResult = [Error(JSON.stringify(testData))];

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('custom object with non function toString prop', () => {
			const testData = {toString: 'not a function'};
			const expectedResult = [Error(JSON.stringify(testData))];

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});

		it('custom object with custom toString function', () => {
			const testData = {randomData: 'could be anything'};
			testData.toString = () => `this.randomData = "${testData.randomData}"}`;

			const expectedResult = [Error(testData.toString())];

			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
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

			testData = new Fate<string>({payload: 'great expectations'});
			expectedResult.push(Error(JSON.stringify(testData)));
			instance.error(testData);

			expect(instance.state.errorLog).toStrictEqual(expectedResult);
		});
	});

	describe('Visual Confirmation Message', () => {
		it('single string', () => {
			const testData = 'spice';
			const expectedResult = [testData];

			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});

		it('single number', () => {
			const testData = 846891;
			const expectedResult = [testData.toString()];

			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});

		it('array of strings', () => {
			const testData = ['zesty', 'lemon', 'drink'];
			const expectedResult = testData;

			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});

		it('array of arrays', () => {
			const testData: any = [[123890, 983249], [198230], [729478], [705323, 491841, 987215]];
			const expectedResult = testData.flat().map((d) => d.toString());

			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});

		it('nested object', () => {
			const testData = {unique: 'identification', complex: {linear: 'algebra'}};
			const expectedResult = [JSON.stringify(testData)];

			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});

		it('custom object with non function toString prop', () => {
			const testData = {toString: 'not what you expect'};
			const expectedResult = [JSON.stringify(testData)];

			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});

		it('custom object with custom toString function', () => {
			const testData = {randomData: 'here is the stuff'};
			testData.toString = () => `this.randomData = "${testData.randomData}"}`;
			const expectedResult = [testData.toString()];

			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
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

			testData = new Fate<string>({payload: 'lord of the flies'});
			expectedResult.push(JSON.stringify(testData));
			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});
	});
});
