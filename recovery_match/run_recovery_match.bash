#!/bin/bash

if [ $# -eq 0 ]; then
  echo "No parameters provided. Please specify an environment using --env=<environment>."
  exit 1
fi

# Define the mode_dev function
mode_dev() {
  local bdd_param="$1"
  cd ../game-data-forge || { echo "Directory ../game-data-forge not found!"; exit 1; }
  ./creation-tables.sh --bdd="$bdd_param" || { echo "Failed to run creation-tables.sh"; exit 1; }
  cd ../recovery_match || { echo "Directory ../recovery_match not found!"; exit 1; }
}

dev_mode=false
bdd_name=""

for param in "$@"; do
  case $param in
    --bdd=*)
      bdd_name="${param#*=}"
      ;;
    --dev=true)
      dev_mode=true
      ;;
    *)
      echo "Unknown parameter: $param"
      exit 1
      ;;
  esac
done

# Execute mode_dev if dev_mode is true
if [ "$dev_mode" = true ]; then
  if [ -z "$bdd_name" ]; then
    echo "The --bdd parameter is required when --dev=true"
    exit 1
  fi
  mode_dev "$bdd_name"
fi

echo -e "##################################\n"

echo "Data retrieval from API for Hall-e database"

echo -e "\n##################################"
# Execute database creation based on bdd_name
echo$
case $bdd_name in
  dynamo)
    echo "Loading environment for DynamoDB"
    if [ -f "./env/.env.dynamodb.sh" ]; then
      source "./env/.env.dynamodb.sh"
      npm run load-data
    else
      echo "Environment file for DynamoDB not found!"
      exit 1
    fi
    ;;
  mysql)
    echo "Loading environment for MySQL"
    if [ -f "./env/.env.mysql.sh" ]; then
      source "./env/.env.mysql.sh"
      npm run load-data
    else
      echo "Environment file for MySQL not found!"
      exit 1
    fi
    ;;
  mongo)
    echo "Loading environment for MongoDB"
    if [ -f "./env/.env.mongo.sh" ]; then
      source "./env/.env.mongo.sh"
      npm run load-data
    else
      echo "Environment file for MongoDB not found!"
      exit 1
    fi
    ;;
  *)
    echo "Unknown configuration value: $bdd_name"
    exit 1
    ;;
esac
