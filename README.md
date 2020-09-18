# Silvernext

Monorepo for Silvernext project.
Find confluence [here](https://icapps.atlassian.net/wiki/spaces/SIL/overview)

## Getting started

### Prerequisites

* [Node](https://nodejs.org/en/)
* [NVM](https://github.com/nvm-sh/nvm)
* [Docker](https://www.docker.com/products/docker-desktop)

### Project dependencies

```bash
# We use yarn for this project
$ npm i yarn -g

# NestJS CLI is used to generate new apps and libraries
$ npm i @nestjs/cli -g

# Install project dependencies
$ yarn
```

### Docker setup

```bash
# Create and run the container - this will also create our database
$ yarn docker:start
```

### Database setup

We use a Postgres instance for our database.

```bash
# Run the existing migrations
$ yarn db:migrate

# Seed the database with initial values
$ yarn db:seed
```

### Running the applications

Before running the applications, every application needs to have a filled in `.env.local`.
See each applications `.env.example` for their respective required values.

```bash
# Run the main application (my-gateway)
$ yarn start
# OR for watch mode
$ yarn start:dev
```

## CI/CD

Every commit for every checked in branch triggers a bitbucket pipelines build.
Builds triggered by non-master / non-develop branches will attempt to build the applications and run all tests.

Commits to develop will trigger a deployment to our development environment on Heroku,
all applications in the monorepo are deployed simultaneously.

## Scripts

### Building and running

```bash
# Removes previous build and create new one
$ yarn build

# For all start commands: append name of project you want to start, defaults to the main app defined in nest-cli.json

# Start application (builds if needed)
$ yarn start

# Start application in watch mode
$ yarn start:dev

# Start application in debug mode
$ yarn start:debug

# Start application in prod mode - separate for different apps
$ yarn start:prod
```

### Database

```bash
# General
# Drop the entire database
$ yarn db:drop

# Drop and migrate
$ yarn db:rollup


# Migrations
# Generate a migration based on current models
$ yarn db:migrate:generate -n <NameOfMigration>

# Apply all migrations
$ yarn db:migrate

# Revert the latest migration
$ yarn db:migrate:revert


# Seeds
# Create a new empty dev seed
$ yarn db:seed:generate -n <NameOfSeed>

# Apply dev seeds
$ yarn db:seed

# Revert the latest dev seed
$ yarn db:seed:revert

# Commands exist for production seeds aswell
$ yarn db:seed:prod:generate -n <NameOfSeed>
$ yarn db:seed:prod
$ yarn db:seed:prod:revert

# Convenience command to execute all seeds
$ yarn db:seed:all
```

See [TypeORM CLI](https://typeorm.io/#/using-cli) docs for more possible commands:

### Formatting + linting

```bash
# Check codebase for formatting errors
$ yarn format:check

# Format codebase
$ yarn format:fix

# Check codebase for linting errors
$ yarn lint
```

### Docker

```bash
# Start (and create if necessary) docker containers
$ yarn docker:start

# Stop running containers
$ yarn docker:stop
```

### Testing

```bash
# Run tests
$ yarn test

# Append name of files or module you want to test, for example:
$ yarn test silvernext
$ yarn test whatever
$ ...
```

### Adding apps or libraries

```bash
# Adds a new library (will add necessary code to nest-cli.json, package.json & tsconfig.json)
$ nest g lib <NameOfLibrary>
# Example for logger: nest g lib logger

# Adds a new application (will add necessary code to nest-cli.json, package.json & tsconfig.json)
$ nest g app <NameOfApplication>
```
