#!/bin/bash

if [ $# -eq 0 ]; then
  echo "No parameters provided. Please specify an environment using --env=<environment>."
  exit 1
fi

for param in "$@"; do
  case $param in
    --env=*)
      bdd_name="${param#*=}"
      case $bdd_name in
        dynamodb)
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
        mongodb)
          echo "Loading environment for MongoDB"
          if [ -f "./env/.env.mongodb.sh" ]; then
            source "./env/.env.mongodb.sh"
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
      ;;
    *)
      echo "Unknown parameter: $param"
      exit 1
      ;;
  esac
done
