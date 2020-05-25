#!bin/bash
​
if [[ "$NODE_ENV" == 'development' ]];
then
    # Drops db, migrates & seeds.
    yarn db:rollup && yarn db:seed:all
else
    # Perform migration and re-seed production values
    yarn db:migrate && yarn db:seed:prod
fi
