# yaml2resume
> No name given yet

## Install

Install it with

```
npm install yaml2resume
```
## Usage

```
Usage:
    yaml2resume [ -t TEMPLATE ] [ -l ] [ -j ]
    yaml2resume list
    yaml2resume ( -h | --help )

Options:
    -h, --help                  help for yaml2resume
    -t, --template TEMPLATE     template file to use     ( 'latex-jr' )
    -l, --latex                 compile the output with `xelatex`.
    -j, --json                  interpret input data as valid json

Commands:
    list                        list current templates

Description:
    This command expands a liquid template (file TEMPLATE) by using
    either valid YAML or JSON read from stdin.

    Note: if TEMPLATE starts with `.` or `/` it is interpreted
    as an absolute file instead of the name of built-in plugin.

```

## Author

* Vittorio Zaccaria

## License
Released under the BSD License.

***



# New features

-     add json input and absolute template filenames -- [Jan 1st 16](../../commit/5160a04c4a910820a0ccf8cf7378a5209d62ac13)