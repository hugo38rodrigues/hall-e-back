#!/bin/bash -e

for param in "$@"
do
  case $param in
    --config=*)
      bdd_name="${param#*=}"
      case $bdd_name in
        dynamoDb)
          echo "Loading environment for DynamoDB"
          source "./config/dynamoDb.env"
          ;;
        mysql)
          echo "Loading environment for MySQL"
          source "./config/sql.env"
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

# Rest of your script can use the loaded environment variables
