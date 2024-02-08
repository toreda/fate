# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.9] - 2024-02-07
* Fixed `Fate` constructor bug where `fate.data` was not set to provided `init.data` when the value evaluated to falsy.


## [0.6.8] - 2023-06-16
* Fixed serialization bug where `errorCode` and `success` were not included during serialization, but were included when deserializing.


## [0.3.0]
* Defaults to fail on 1 or more errors but cann't succeed if payload is not set.
* Added `isSuccess` and `isFailure` methods.
* `complete` method will try to set the state to failure or success
* `errors` method returns a boolean for whether the ActionResult has failed
* `error` method and message method accept any type and convert
* New getData method return the payload or a list of errors if failure has occurred
* payload can be set during instantiation


### Added
-   Initial early release. Project API is not stable until v1.0.0+

[0.6.8]: https://github.com/toreda/action-result/compare/v0.3.0...v0.6.8
[0.3.0]: https://github.com/toreda/action-result/compare/v0.1.0...v0.3.0
[0.1.0]: https://github.com/toreda/action-result/compare/v0.0.0...v0.1.0
[unreleased]: https://github.com/toreda/action-result/compare/v0.0.0...HEAD
