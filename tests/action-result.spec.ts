import {ActionResult} from '../src/action-result';
import {ActionResultCode} from '../src/action-result/code';
import {ActionResultState} from '../src/action-result/state';

describe('ActionResult<T>', () => {
	let instance: ActionResult<string>;

	beforeAll(() => {
		instance = new ActionResult<string>({errorThreshold: Infinity});
	});

	beforeEach(() => {
		instance.payload = (undefined as unknown) as string;
		instance.state.errorLog.length = 0;
		instance.state.messageLog.length = 0;
		instance.code = ActionResultCode.NOT_SET;
	});

	describe('Constructor', () => {
		describe('constructor', () => {
			it('should initialize state', () => {
				expect(instance.state).not.toBeUndefined();
			});

			it('should intialize code to NOT_SET', () => {
				expect(instance.code).toBe(ActionResultCode.NOT_SET);
			});

			it('should initialize payload to undefined', () => {
				expect(instance.payload).toBeUndefined();
			});

			it('should not throw with no args', () => {
				expect(() => {
					new ActionResult<string>();
				}).not.toThrow();
			});

			it('should call ActionResultState with options arg', () => {
				const spy = jest.spyOn(ActionResultState.prototype, 'parse');
				const options = {errorThreshold: 10};
				new ActionResult<string>(options);
				expect(spy).toBeCalledWith(options);
			});

			it('should call parseOptions with options arg', () => {
				const spy = jest.spyOn(ActionResult.prototype, 'parseOptions');
				const options = {payload: 'idfj'};
				new ActionResult<string>(options);
				expect(spy).toBeCalledWith(options);
			});
		});

		describe('parseOptions', () => {
			it('should call parseOptionsPayload with options arg', () => {
				const spy = jest.spyOn(instance, 'parseOptionsPayload');
				const options = {payload: 'idfj'};
				instance.parseOptions(options);
				expect(spy).toBeCalledWith(options);
			});

			it('should return object with payload key', () => {
				const expectedV = 'xciower';
				expect(instance.parseOptions({payload: expectedV}).payload).toBe(expectedV);
			});
		});

		describe('parseOptionsPayload', () => {
			it('should return undefined if options.payload is undefined', () => {
				const expectedV = undefined;
				expect(instance.parseOptionsPayload()).toBe(expectedV);
			});

			it('should return options.payload if it is defined', () => {
				const expectedV = 'kjlxzcv';
				expect(instance.parseOptionsPayload({payload: expectedV})).toBe(expectedV);
			});

			it('should return options.payload if it is defined and nullable', () => {
				const expectedV = '';
				expect(instance.parseOptionsPayload({payload: expectedV})).toBe(expectedV);
			});
		});
	});

	describe('Helpers', () => {
		describe('forceFailure', () => {
			it('should change the code to FAILURE', () => {
				instance.forceFailure();
				expect(instance.code).toBe(ActionResultCode.FAILURE);
			});

			it('should return ActionResult', () => {
				expect(instance.forceFailure()).toBe(instance);
			});
		});

		describe('forceSuccess', () => {
			it('should change the code to SUCCESS', () => {
				instance.forceSuccess();
				expect(instance.code).toBe(ActionResultCode.SUCCESS);
			});

			it('should return ActionResult', () => {
				expect(instance.forceSuccess()).toBe(instance);
			});
		});
	});

	describe('Implementation', () => {
		let spyForceFailure: jest.SpyInstance;
		let spyForceSuccess: jest.SpyInstance;

		beforeAll(() => {
			spyForceFailure = jest.spyOn(instance, 'forceFailure');
			spyForceSuccess = jest.spyOn(instance, 'forceSuccess');
		});

		beforeEach(() => {
			spyForceFailure.mockClear();
			spyForceSuccess.mockClear();
		});

		afterAll(() => {
			spyForceFailure.mockRestore();
			spyForceSuccess.mockRestore();
		});

		describe('complete', () => {
			it('should call neither forceFailure or forceSuccess if payload is null', () => {
				expect(instance.payload).toBeUndefined();

				instance.complete();

				expect(spyForceFailure).not.toBeCalled();
				expect(spyForceSuccess).not.toBeCalled();
			});

			it('should call forceFailure if payload is not null but state hasFailed is true', () => {
				jest.spyOn(instance.state, 'hasFailed').mockReturnValueOnce(true);
				instance.payload = '';

				instance.complete();

				expect(spyForceFailure).toBeCalled();
				expect(spyForceSuccess).not.toBeCalled();
			});

			it('should call forceSuccess if payload is not null and state hasFailed is false', () => {
				jest.spyOn(instance.state, 'hasFailed').mockReturnValueOnce(false);
				instance.payload = '';

				instance.complete();

				expect(spyForceFailure).not.toBeCalled();
				expect(spyForceSuccess).toBeCalled();
			});

			it('should return ActionResult', () => {
				expect(instance.complete()).toBe(instance);
			});
		});

		describe.each([
			['error', 'errorLog'],
			['message', 'messageLog']
		])('%s', (func, log) => {
			it(`should add single ${func} to state ${log}`, () => {
				expect(instance.state[log].length).toBe(0);
				let counter = 0;

				while (counter < 5) {
					counter++;
					instance[func](`new ${func} ${counter}`);
					expect(instance.state[log].length).toBe(counter);
				}
			});

			it(`should add multiple ${func}s to state ${log}`, () => {
				expect(instance.state[log].length).toBe(0);

				const customlog = ['string test', 918230, {key: 'value'}, null, Error('error message')];

				instance[func](customlog);
				expect(instance.state[log].length).toBe(customlog.length);
			});
		});

		describe('error', () => {
			it('should call forceFailure if not currently failing and state hasFailed returns true', () => {
				jest.spyOn(instance.state, 'hasFailed').mockReturnValueOnce(true);
				jest.spyOn(instance, 'isFailure').mockReturnValueOnce(false);

				instance.error(Error('test error 098'));
				expect(spyForceFailure).toBeCalledTimes(1);

				instance.error(Error('test error 972'));
				expect(spyForceFailure).toBeCalledTimes(1);
			});

			it('should not call forceFailure if state hasFailed returns false', () => {
				jest.spyOn(instance.state, 'hasFailed').mockReturnValueOnce(false);

				instance.error(Error('test error 385'));
				expect(spyForceFailure).not.toBeCalled();
			});

			it('should return false if code is FAILURE', () => {
				instance.forceFailure();
				expect(instance.error(Error('test error 555'))).toBe(false);
			});

			it('should return true if code is not FAILURE', () => {
				expect(instance.error(Error('test error 935'))).toBe(true);

				instance.forceSuccess();
				expect(instance.error(Error('test error 721'))).toBe(true);
			});
		});

		describe('message', () => {
			it('should return ActionResult', () => {
				expect(instance.message('test message 555')).toBe(instance);
			});
		});

		describe('getData', () => {
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

			it('should return the payload if code is not FAILURE', () => {
				const spy = jest.spyOn(instance, 'isFailure').mockReturnValue(false);
				expect(instance.getData()).toBe(instance.payload);
				instance.payload = 'success payload';
				expect(instance.getData()).toBe(instance.payload);
				spy.mockRestore();
			});
		});

		describe.each([
			['isFailure', 'FAILURE'],
			['isSuccess', 'SUCCESS']
		])('%s', (description, descriptionCode) => {
			it.each([
				[descriptionCode === 'NOT_SET', 'NOT_SET'],
				[descriptionCode === 'SUCCESS', 'SUCCESS'],
				[descriptionCode === 'FAILURE', 'FAILURE']
			])('should return %p when code is %s', (expectedV, testCode) => {
				instance.code = ActionResultCode[testCode];
				expect(instance[description]()).toBe(expectedV);
			});
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

			testData = new ActionResult<string>({payload: 'great expectations'});
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

			testData = new ActionResult<string>({payload: 'lord of the flies'});
			expectedResult.push(JSON.stringify(testData));
			instance.message(testData);

			expect(instance.state.messageLog).toStrictEqual(expectedResult);
		});
	});
});
