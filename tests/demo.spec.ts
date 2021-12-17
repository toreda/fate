import {Fate} from '../src/fate';

it(`not done yet and no success`, () => {
	const fate = new Fate();

	const hasFailed = true;
	const hasSucceded = !hasFailed;

	expect(fate.done()).toBe(false);
	expect(fate.success()).toBe(hasSucceded);

	expect(fate.isDoneAndFailed()).toBe(false);
	expect(fate.isDoneAndSucceeded()).toBe(false);
});

it(`not done yet but has success`, () => {
	const fate = new Fate();
	fate.success(true);

	const hasSucceded = true;
	const _hasFailed = !hasSucceded;

	expect(fate.done()).toBe(false);
	expect(fate.success()).toBe(hasSucceded);

	expect(fate.isDoneAndFailed()).toBe(false);
	expect(fate.isDoneAndSucceeded()).toBe(false);
});

it(`setErrorCode`, () => {
	const fate = new Fate();
	fate.setErrorCode('');

	const hasFailed = true;
	const hasSucceded = !hasFailed;

	expect(fate.done()).toBe(true);
	expect(fate.success()).toBe(hasSucceded);

	expect(fate.isDoneAndFailed()).toBe(hasFailed);
	expect(fate.isDoneAndSucceeded()).toBe(hasSucceded);
});

it(`setDone with error`, () => {
	const fate = new Fate();
	fate.error('');
	fate.setDone();

	const hasFailed = true;
	const hasSucceded = !hasFailed;

	expect(fate.done()).toBe(true);
	expect(fate.success()).toBe(hasSucceded);

	expect(fate.isDoneAndFailed()).toBe(hasFailed);
	expect(fate.isDoneAndSucceeded()).toBe(hasSucceded);
});

it(`setDone without error`, () => {
	const fate = new Fate();
	fate.setDone();

	const hasSucceded = true;
	const hasFailed = !hasSucceded;

	expect(fate.done()).toBe(true);
	expect(fate.success()).toBe(hasSucceded);

	expect(fate.isDoneAndFailed()).toBe(hasFailed);
	expect(fate.isDoneAndSucceeded()).toBe(hasSucceded);
});

it(`setSuccess true`, () => {
	const fate = new Fate();
	fate.setSuccess(true);

	const hasSucceded = true;
	const hasFailed = !hasSucceded;

	expect(fate.done()).toBe(true);
	expect(fate.success()).toBe(hasSucceded);

	expect(fate.isDoneAndFailed()).toBe(hasFailed);
	expect(fate.isDoneAndSucceeded()).toBe(hasSucceded);
});

it(`setSuccess false`, () => {
	const fate = new Fate();
	fate.setSuccess(false);

	const hasFailed = true;
	const hasSucceded = !hasFailed;

	expect(fate.done()).toBe(true);
	expect(fate.success()).toBe(hasSucceded);

	expect(fate.isDoneAndFailed()).toBe(hasFailed);
	expect(fate.isDoneAndSucceeded()).toBe(hasSucceded);
});
