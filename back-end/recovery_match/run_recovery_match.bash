#!/bin/bash

for param in "$@"; do
  case $param in
    --config=*)
      bdd_name="${param#*=}"
      case $bdd_name in
        dynamoDb)
          echo "Loading environment for DynamoDB"
          if [ -f "./config/.env.dynamodb.sh" ]; then
            source "./config/.env.dynamodb.sh"
            npm run load-data
          else
            echo "Environment file for DynamoDB not found!"
            exit 1
          fi
          ;;
        mysql)
          echo "Loading environment for MySQL"
          if [ -f "./config/.env.sql.sh" ]; then
            source "./config/.env.sql.sh"
            npm run load-data
          else
            echo "Environment file for MySQL not found!"
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
