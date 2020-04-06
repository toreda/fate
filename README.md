# ArmorJS - Action Result

![CI](https://github.com/armorjs/action-result/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=armorjs_action-result&metric=coverage)](https://sonarcloud.io/dashboard?id=armorjs_action-result) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=armorjs_action-result&metric=alert_status)](https://sonarcloud.io/dashboard?id=armorjs_action-result)


@armorjs/action-result provides a simple, consistent interface to parse action results when you need more than

## Contents
- [Examples]
- [About ArmorJS](#about-armorjs)
- [Installation](#Installation)
- [Usage](#usage)
- [Build](#build)
- [Testing](#testing)
- [License](#license)

## Examples

## About ArmorJS
ArmorJS solves unique challenges in the enterprise node ecosystem. Auditing projects for security, reliability, and even license compatibility are monumental tasks when a project includes thousands of frequently changing dependencies.

ArmorJS standards:
* Full typescript support.
* Consistent API between releases.
* Extremely small footprint (for webpacking).
* No more than 5 external dependencies (excluding dev dependencies).
* Compatible with web, node, and serverless deployment.
* Thorough test coverage.
* MIT License.

## Install

***With yarn (preferred):***
```yarn add @armorjs/action-result```

With NPM:
```npm install @armorjs/action-result```

## Usage

### Library Usage

#### Typescript
```
import { ArmorActionResult } from '@armorjs/action-result';
```

#### Node
```
const ArmorConfig = require('@armorjs/action-result');
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
[MIT](LICENSE) &copy; Michael Brich