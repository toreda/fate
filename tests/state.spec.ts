import {ARState} from '../src/state';

describe('ARState', () => {
	let instance: ARState;

	beforeAll(() => {
		instance = new ARState();
	});

	describe('Constructor', () => {
		it('should initialize errors to an empty array', () => {
			expect(instance.errors).toEqual([]);
		});

		it('should initialize messages to an empty array', () => {
			expect(instance.messages).toEqual([]);
		});

		it('should define failOnError', () => {
			expect(instance.failOnError).not.toBeUndefined();
		});
	});

	describe('Implementation', () => {
		describe('hasFailed', () => {
			it('should return false when no errors are present', () => {
				const customInstance = new ARState();
				expect(customInstance.errors.length).toBe(0);
				expect(customInstance.hasFailed()).toBe(false);
			});

			it('should return false when failOnError is disabled', () => {
				const customInstance = new ARState({
					failOnError: {
						enabled: false
					}
				});
				customInstance.errors.push(new Error('error goes here'));
				expect(customInstance.failOnError.enabled).toBe(false);
				expect(customInstance.hasFailed()).toBe(false);
			});

			it('should return false when failOnError is enabled but no errors are present', () => {
				const customInstance = new ARState({
					failOnError: {
						enabled: true,
						threshold: 1
					}
				});

				expect(customInstance.failOnError.enabled).toBe(true);
				expect(customInstance.hasFailed()).toBe(false);
			});

			it('should return false when failOnError is enabled and the error count is lower than threshold', () => {
				const customInstance = new ARState({
					failOnError: {
						enabled: true,
						threshold: 2
					}
				});
				customInstance.errors.push(new Error('message here'));
				expect(customInstance.failOnError.enabled).toBe(true);
				expect(customInstance.hasFailed()).toBe(false);
			});

			it('should return true when failOnError is enabled and the error count is exactly at threshold', () => {
				const customInstance = new ARState({
					failOnError: {
						enabled: true,
						threshold: 2
					}
				});
				customInstance.errors.push(new Error('message 1 here'));
				customInstance.errors.push(new Error('message 2 here'));
				expect(customInstance.failOnError.enabled).toBe(true);
				expect(customInstance.failOnError.threshold).toBe(2);
				expect(customInstance.hasFailed()).toBe(true);
			});

			it('should return true when failOnError is enabled and the error count exceeds threshold', () => {
				const customInstance = new ARState({
					failOnError: {
						enabled: true,
						threshold: 2
					}
				});
				customInstance.errors.push(new Error('message 1 here'));
				customInstance.errors.push(new Error('message 2 here'));
				customInstance.errors.push(new Error('message 3 here'));
				expect(customInstance.failOnError.enabled).toBe(true);
				expect(customInstance.failOnError.threshold).toBe(2);
				expect(customInstance.hasFailed()).toBe(true);
			});
		});

		describe('parseFailOnError', () => {
			const DEFAULT_THRESHOLD = 1;
			const MOCK_DEFAULT_FAILONERROR = {
				enabled: false,
				threshold: DEFAULT_THRESHOLD
			};

			it('should return default response when options argument not provided', () => {
				expect(instance.parseFailOnError(undefined)).toEqual(MOCK_DEFAULT_FAILONERROR);
			});

			it('should return default response when options argument is provided but failOnError property is missing', () => {
				expect(instance.parseFailOnError({})).toEqual(MOCK_DEFAULT_FAILONERROR);
			});

			it('should return default response when failOnError.enabled is truthy, but not a valid boolean', () => {
				expect(
					instance.parseFailOnError({
						failOnError: {
							enabled: 1 as any
						}
					})
				).toEqual(MOCK_DEFAULT_FAILONERROR);
			});

			it('should return enabled true when failOnError.enabled is true', () => {
				expect(
					instance.parseFailOnError({
						failOnError: {
							enabled: true
						}
					}).enabled
				).toBe(true);
			});

			it('should return enabled false when failOnError.enabled is false', () => {
				expect(
					instance.parseFailOnError({
						failOnError: {
							enabled: false
						}
					}).enabled
				).toBe(false);
			});

			it('should return threshold when failOnError.enabled is a valid number', () => {
				const expectedResult = 141;
				expect(
					instance.parseFailOnError({
						failOnError: {
							enabled: true,
							threshold: expectedResult
						}
					}).threshold
				).toBe(expectedResult);
			});

			it('should parse and return threshold when failOnError.enabled is a number string', () => {
				const expectedResult = 141;
				expect(
					instance.parseFailOnError({
						failOnError: {
							enabled: true,
							threshold: expectedResult.toString()
						}
					}).threshold
				).toBe(expectedResult);
			});

			it('should return default threshold when threshold string parses to NaN', () => {
				const expectedResult = DEFAULT_THRESHOLD;
				expect(
					instance.parseFailOnError({
						failOnError: {
							enabled: true,
							threshold: 'aaaaaa'
						}
					}).threshold
				).toBe(expectedResult);
			});
		});
	});
});
