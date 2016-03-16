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

-     fix test environment -- [Feb 29th 16](../../commit/0dc60a8cafd95e3c0dfdc817258028d3f3688b36)
-     add missing package -- [Feb 25th 16](../../commit/d5120c1f4dfff9bce2d9624df62a617b12166ccc)
-     add json input and absolute template filenames -- [Jan 1st 16](../../commit/5160a04c4a910820a0ccf8cf7378a5209d62ac13)

# Bug fixes

-     use updated zaccaria-cli -- [Mar 16th 16](../../commit/76da216a5ca3136656cbb5832516237707305ef9)
-     prefix with current dir -- [Mar 16th 16](../../commit/09f099d4c336d8d684988d7eea96296c4052da73)
-     remove usage of readlocal -- [Mar 16th 16](../../commit/695c0dc70bee823d94b8f27fc9e23c466b404dc2)
-     create build dir before compiling -- [Feb 29th 16](../../commit/b03f018bca39d71ee501e75fad76ea7baef08348)
