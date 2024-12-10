# SQL Database Assistant for Aichat

This repo contains the agents configuration for aichat compatible with PostgresSQL and MySQL databases.

## Installation

1. Copy the folder agents/* into your aichat folder `functions/agents/`.
2. Add the new agents into the `functions/agents.txt` file.

```
pg-assistant
my-assistant
```

3. expoorts the following environment variables in your .bashrc or .bash_profile file.

```
export PG_ASSISTANT_DB_HOST=host
export PG_ASSISTANT_DB_PORT=5432
export PG_ASSISTANT_DB_USER=user
export PG_ASSISTANT_DB_PASSWORD=password
export PG_ASSISTANT_DB_NAME=database
export MYSQL_ASSISTANT_DB_HOST=127.0.0.1
export MYSQL_ASSISTANT_DB_PORT=3306
export MYSQL_ASSISTANT_DB_USER=root
export MYSQL_ASSISTANT_DB_PASSWORD=password
export MYSQL_ASSISTANT_DB_NAME=database
```

4. Load the agent with

```
.agent my-assistant
.agent pg-assistant
```