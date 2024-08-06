# run docker
docker run --name hall-e -e MYSQL_USER=<USER> -e MYSQL_PASSWORD=<USER_PASSWORD> -e MYSQL_DATABASE=hall-e -e MYSQL_ROOT_PASSWORD=<ROOT_PASSWORD> -p 3306:3306 -d mysql

./run_recovery_match.bash --bdd=<NAME_OF_DATABASE>
./run_recovery_match.bash --bdd=<NAME_OF_DATABASE> --dev=true