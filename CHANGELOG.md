# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0]
	Renamed package to Fate.
	Fate can be serialized into a string and be instantiate from a serialized string.

## [v0.3.0]
	Defaults to fail on 1 or more errors.
	can not succeed if payload is not set.
	added isSuccess and isFailure methods.
	complete method will try to set the state to failure or success
	erros method returns a boolean for whether the ActionResult has failed
	error method and message method accept any type and convert
	new getData method return the payload or a list of errors if failure has occurred
	payload can be set during instantiation


### Added
-   Initial early release. Project API is not stable until v1.0.0+

[v0.1.0]: https://github.com/toreda/action-result/compare/v0.0.0...v0.1.0
[unreleased]: https://github.com/toreda/action-result/compare/v0.0.0...HEAD