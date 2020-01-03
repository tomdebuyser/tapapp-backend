#!bin/bash

# Seed if dev
if [[ "$NODE_ENV" == 'development' ]];
then
    # Drops db, migrates & seeds.
    yarn db:rollup && yarn seed
else
    # Don't seed, just run migrations.
    yarn migrate
fi
