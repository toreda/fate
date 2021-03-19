import {json} from './aliases';

export function serializeErrors(key: string, errors: unknown): unknown {
	if (!Array.isArray(errors) || errors.length === 0) {
		return errors;
	}

	if (!(errors[0] instanceof Error)) {
		return errors;
	}

	const list: unknown[] = [];

	for (const error of errors) {
		const asString = {};

		Object.getOwnPropertyNames(error).forEach(function (key) {
			asString[key] = error[key];
		});

		list.push(asString);
	}

	return list;
}

export function parseError(json: json): Error {
	const error = Error();

	error.message = json.message;
	error.stack = json.stack;

	return error;
}
