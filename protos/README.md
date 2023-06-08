<div align="center">

# Protocol buffers

</div>

## Directories

- `/protos/bot` - Discord bot RPCs
- `/protos/discord-status` - Discord-status service RPCs
- `/protos/types` - Shared protobuf types

## Development requirements

- [Buf](https://buf.build)

## Developing

To lint any changes:

```bash
buf lint protos
```

To build your changes:

```bash
buf build protos
```

To test breaking changes:

```bash
buf breaking protos --against ".git#branch=main"
```
