#!bin/bash
​
if [[ "$NODE_ENV" == 'development' ]];
then
    # Drops db, migrates & seeds.
    yarn db:rollup && yarn seed:all
else
    # Perform migration and re-seed production values (GW parameters)
    yarn migrate && yarn seed:prod
fi