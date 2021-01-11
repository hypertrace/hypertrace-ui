# Hypertrace UI

![build-and-test](https://github.com/hypertrace/hypertrace-ui/workflows/build-and-test/badge.svg)
[![codecov](https://codecov.io/gh/hypertrace/hypertrace-ui/branch/main/graph/badge.svg)](https://codecov.io/gh/hypertrace/hypertrace-ui)

## Prerequisites

Install Node + NPM

## Setup

- Install Dependencies

  `npm install`

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Running unit tests

Run `npm run test` to execute the unit tests via Jest

## Technologies

1. Angular
2. Typescript
3. RxJS
4. [D3](https://d3js.org/)
5. [Spectator](https://github.com/ngneat/spectator) (_Unit Testing_)

## UI Architecture

| <img src="https://hypertrace-docs.s3.amazonaws.com/ui-architecture.png" width="400" height="400"/> |
| :------------------------------------------------------------------------------------------------: | --- |
|                                    _Hypertrace UI Architecture_                                    | d   |

## Building Image locally

Hypertrace UI uses gradle to build a docker image. Gradle wrapper is already part of the source code. To build Hypertrace UI image, run:

```
./gradlew dockerBuildImages
```

## Docker Image Source:

- [DockerHub > Hypertrace UI](https://hub.docker.com/r/hypertrace/hypertrace-ui)
