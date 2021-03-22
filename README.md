# `@toreda/fate`

![Toreda](https://content.toreda.com/logo/toreda-logo.png)

![CI](https://github.com/toreda/fate/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=toreda_fate&metric=coverage)](https://sonarcloud.io/dashboard?id=toreda_fate) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=toreda_fate&metric=alert_status)](https://sonarcloud.io/dashboard?id=toreda_fate)


Simple interface return a result and details or context about the result.

## Install

***With yarn (preferred):***
```yarn add @toreda/fate```

With NPM:
```npm install @toreda/fate```

## Usage

### Library Usage

#### Typescript
```
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

#### Node
```
const Fate = require('@toreda/fate');
```

## Build
Build (or rebuild) the config package:

***With Yarn (preferred):***
```
yarn install
yarn build
```

With NPM:
```
npm install
npm run-script build
```

## Testing

Config implements unit tests using jest. Run the following commands from the directory where config has been installed.

***With yarn (preferred):***
```
yarn install
yarn test
```

With NPM:
```
npm install
npm run-script test
```

## License
[MIT](LICENSE) &copy; Toreda, Inc.