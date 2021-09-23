Based off of [Keep a Changelog](https://keepachangelog.com/)

# [Unreleased]

## [1.1.2] - [UNKNOWN]
### Addws
* Install sentry-sdk[flask] package to allow better logging with Sentry
### Fixed
* Pages now display the correct title
### Removed
* Disable functionality of the Plagiarism Checker button.  MOSS would often timeout for a large number of users.  This will be readded in a future release.

## [1.1.1] - 2021-09-20
### Changed
* Update extra day redemption message to be more verbose

## [1.1.0] - 2021-09-20
### Added
* Filter for instructors to refine student list

### Changed
* Automatically sort the user list by last name

# [Released]

## [1.0.0] - 2021-09-13
* Initial release of TA-Bot
### Fixed
* Fix hardcode value of 10 for submission counter in the instructor view
* Fix hidden test cases being not visible to admins
* Increase prevention that to deny students bypassing the timeout by having two tabs open
