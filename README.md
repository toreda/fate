# `@toreda/action-result`

![Toreda](https://content.toreda.com/logo/toreda-logo.png)

![CI](https://github.com/toreda/action-result/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=toreda_action-result&metric=coverage)](https://sonarcloud.io/dashboard?id=toreda_action-result) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=toreda_action-result&metric=alert_status)](https://sonarcloud.io/dashboard?id=toreda_action-result)


Simple interface return a result and details or context about the result.

## Install

***With yarn (preferred):***
```yarn add @toreda/action-result```

With NPM:
```npm install @toreda/action-result```

## Usage

### Library Usage

#### Typescript
```
import {ActionResult} from '@toreda/action-result';
```

#### Node
```
const ARConfig = require('@toreda/action-result');
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