#!/bin/bash

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
        sql)
          echo "Loading environment for MySQL"
          if [ -f "./env/.env.sql.sh" ]; then
            source "./env/.env.sql.sh"
            npm run load-data
          else
            echo "Environment file for MySQL not found!"
            exit 1
          fi
          ;;
        mongodb)
          echo "Loading environment for MySQL"
          if [ -f "./env/.env.sql.sh" ]; then
            source "./env/.env.sql.sh"
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
