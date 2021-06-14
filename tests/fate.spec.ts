import {Fate} from 'src/fate';

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
		it('should change code to FAILURE if threshold is reached', () => {
			Object.defineProperty(instance, 'errorThreshold', {value: 0});
			expect(instance.status()).toBe(0);

			instance.error('forces failure');

			expect(instance.status()).toBe(-1);
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
