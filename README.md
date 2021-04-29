# Tapapp

Monorepo for Tapapp project.
Find confluence [here](https://icapps.atlassian.net/wiki/spaces/SIL/overview)

## Getting started

### Prerequisites

-   [Node](https://nodejs.org/en/)
-   [NVM](https://github.com/nvm-sh/nvm)
-   [Docker](https://www.docker.com/products/docker-desktop)

### Project dependencies

```bash
# We use yarn for this project
$ npm i yarn -g

# NestJS CLI is used to generate new apps and libraries
$ npm i @nestjs/cli -g

# Install project dependencies
$ yarn
```

### NVM

After installing NVM, make sure you are running the proper version of node using the following instructions.

```bash
# This will switch active node versions to the one defined in the .nvmrc file, in the root.
$ nvm use

# If that version is not installed, NVM will instruct you to install the correct version.
$ nvm install 12.18.3 # example

# After this, you can use `nvm use` again, and it will work properly.
```

### Docker setup

First things, we need to change we use for the docker-compose project, to something that fits the new repository.

```json
"docker:start": "docker-compose -f ./docker/docker-compose.yml up -d",
"docker:stop": "docker-compose -f ./docker/docker-compose.yml stop",
```

```bash
# Create and run the container - this will also create our database
$ yarn docker:start
```

### Database setup

We use a Postgres instance for our database.

Before being able to migrate or seed the database, we'll need to fill in the `.env.example` file inside the data folder.
Create a new `.env.local` file next to it, and fill in the values. The example file will contain correct values for our local environment.

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

For git, we use a simplified version of Git Flow. The `master` branch is the one that will always contain the latest version of our code.
To build new features, or to fix bugs, create `feature/**` or `bugfix/**` branches. Write your code here, and merge these back into `master` via a pull request.
Direct commits to `master` should be avoided, although under certain circumstances might be necessary.

Every commit to a branch with an open pull request will trigger a BitBucket pipeline that will build the code, lint it, check the formatting, and run all tests.
Every commit or merge to `master` will go through the same steps as a pull request commit, but it will also trigger an automatic deploy to our Heroku environment.

In order to create staging or production builds, create a new `release/YYYY-MM-DD` branch and push it.
Every `release/**` branch will trigger a pipeline that will one again, go through all the same steps as a pull request pipeline.
When these steps are complete, there is a manual trigger to deploy to staging, and when this staging deployment is complete, and verified working,
there is a subsequent manual trigger to a production deployment.

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
$ yarn test tapapp
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
