<div align="center">

# Discord incident

</div>

## Dev environment

To set up a dev environment, check out the [contribution guide](../../.github/CONTRIBUTING.md).

## Developing

First, install the Go modules:

```bash
go mod download
```

Then you'll need to generate the database and Protobuf files:

```bash
task db:generate
task buf:generate
```

Once those two commands are run, you can build and then start the server:

```bash
task build
task start
```

## Docker

To build a docker image of the application, run this command:

```bash
yarn docker:incident
```
