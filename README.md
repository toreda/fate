![Toreda](https://content.toreda.com/logo/toreda-logo.png)

![CI](https://img.shields.io/github/workflow/status/toreda/fate/CI?style=for-the-badge) [![Coverage](https://img.shields.io/sonar/coverage/toreda_fate?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge)](https://sonarcloud.io/dashboard?id=toreda_fate) ![Sonar Quality Gate](https://img.shields.io/sonar/quality_gate/toreda_fate?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge) ![GitHub issues](https://img.shields.io/github/issues/toreda/fate?style=for-the-badge)

![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/toreda/fate/master?style=for-the-badge)
![GitHub Release Date](https://img.shields.io/github/release-date/toreda/fate?style=for-the-badge)

![license](https://img.shields.io/github/license/toreda/fate?style=for-the-badge)

&nbsp;

# `@toreda/fate`

Return function results, errors, status, and logs with one object.


&nbsp;

# Install

**_With yarn (preferred):_**

```bash
yarn add @toreda/fate
```

With NPM:

```bash
npm install @toreda/fate
```

&nbsp;

# Usage

## Library Usage

### Typescript

```typescript
import {Fate} from '@toreda/fate';

function request(): Fate<string> {
	// Can set the type of payload by calling Fate with a type arg.
	// Payload type defaults to unknown.
	const fate = new Fate<string>();

	const result = someAction();

	if (thereIsAProblem()) {
		return fate.error('whatever is passed will get converted to an Error obj if it isnt one');
	}

	fate.state.payload = result;
}

const fate = request();

if (fate.isFailure()) {
	// fate.state.errorLog holds all the errors that were attached to the fate
}

if (fate.isSuccess()) {
	// fate.state.payload
}

// Returns Error[] if fate fails, the payload if fate succeeds, or Error[] with a single error if payload is null/undefined
console.log(fate.getData());

// Converts all the state data into a string
const serialized = fate.serialize();

// Uses serialized state data to rebuild a fate
const fromSerial = new Fate({serialized});
```

## TypeScript

```typescript
import {Fate} from '@toreda/fate';

const fate = new Fate<never>();

if (fate.success()) {
	console.info(`Success`);
} else {
	console.info(`Failed`);
}
```

```typescript
import {Fate} from '@toreda/fate';

function isPositive(value: number): Fate<boolean> {
	// Fate instance containing a boolean with an initial value `false`.
	const fate = new Fate<boolean>({
		data: false
	});

	// Sets success to false & sets an error code.
	if (typeof value !== 'number') {
		return fate.setErrorCode('non_number_value');
	}


	fate.data = value >= 0;

	return fate.setSuccess(true);
}

const result = isPositive(1);
if (result.success()) {
	// Function succeeded.
	if (fate.data === true) {
		console.info(`${value} is positive`);
	} else {
		console.info(`${value} is negative`);
	}
} else {
	console.error(`isPositive failed with error code: ${result.errorCode()});
}
```

&nbsp;

# Build

Build (or rebuild) the config package:

**_With Yarn (preferred):_**

```bash
yarn install
yarn build
```

With NPM:

```bash
npm install
npm run-script build
```

&nbsp;

# Testing

Config implements unit tests using jest. Run the following commands from the directory where config has been installed.

**_With yarn (preferred):_**

```
yarn install
yarn test
```

With NPM:

```
npm install
npm run-script test
```

&nbsp;

# Legal

## License

[MIT](LICENSE) &copy; Toreda, Inc.

&nbsp;

## Copyright

Copyright &copy; 2019 - 2022 Toreda, Inc. All Rights Reserved.

https://www.toreda.com
