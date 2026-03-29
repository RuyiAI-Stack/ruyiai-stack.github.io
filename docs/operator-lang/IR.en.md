# Intermediate Representation (IR) Dumps

To facilitate debugging and analysis, the triton-shared project now supports emitting all intermediate representations (IRs) generated during the compilation process. This functionality is controlled via the environment variable `TRITON_SHARED_DUMP_PATH`.

## How It Works

By setting the `TRITON_SHARED_DUMP_PATH` environment variable, you specify a directory where all intermediate representations will be saved. The Triton compiler will emit IR dumps at various stages of compilation into the specified folder, allowing developers to inspect and analyze the transformations applied to the code.

## How to Use

Create a directory where the IR dumps will be stored (e.g., /path/to/dump_dir).
Set the `TRITON_SHARED_DUMP_PATH` environment variable to the directory path:
`export TRITON_SHARED_DUMP_PATH=/path/to/dump_dir`
Run your Triton compilation as usual. The compiler will emit IR dumps into the specified directory.

## Example

Suppose your dump directory is `/tmp/ir_dumps`. Before running your code, set the environment variable:

```sh
export TRITON_SHARED_DUMP_PATH=/tmp/ir_dumps
```

After the compilation process completes, you can explore the `/tmp/ir_dumps` directory to find all the intermediate representation files.

```sh
$ ls /tmp/ir_dumps
ll.ir  ll.mlir  tt.mlir  ttshared.mlir
```
