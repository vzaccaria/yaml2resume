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
