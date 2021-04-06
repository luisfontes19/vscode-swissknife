# Change Log

All notable changes to the "swissknife" extension will be documented in this file.

## 1.3.0

* Add script to sort lines
* Add scripts to start servers (http/https to inspect requests and/or serve folders)
* Fix EC Keypair script name and desc (were same as RSA)
* Add possibility to call other scripts (and methods) (native and user made) from custom user scripts through context.modules

## 1.2.1

* Temporarily removed bcrypt script as it was causing conflicts in the bundled solution

## 1.2.0

* Add script to generate BCrypt hashes
* Updated hash-identifier dependency to support Bcrypt hashes
* Fixed multi-selection issue where only one would be processed
* Added support for Mac TouchBar

## 1.1.0

* Fix bug that didn't use selected text in informationRoutine
* Add script to identify hash algorithms
* Add script for eliptic curve key pair generation

## 1.0.0

* Renamed some scripts for better usage
* Added Morse code convertion
* Added Unicode convertions
* Improved bundling process
  * Core scripts are now loaded with default imports, which allows us to bundle the entire code into one single file

## 0.0.5

### Added

* Option to generate self signed certificates

## 0.0.4

### Bug Fixes

* removed ncc as it was causing problems due to the script loading mechanism

## 0.0.3

* convert crypto currencies values. (can be used like: 1btc to eur. or just supply a value, and a dropdown will show to specify from and to cryptos)
* ncc to create smaller builds of the extension
* convert text from and to binary
* convert string to escaped string
* URL expander

## 0.0.2

* Fixed bug that prevented script from activating properly in production (missing dependency in prod)
* Fixed bug when creating script's folder, the extension folder could not exist.

## 0.0.1

* Initial release