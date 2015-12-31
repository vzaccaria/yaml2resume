/* eslint quotes: [0], strict: [0] */
var {
    $d, $o, $f, $r, $b, withTmpDir, $s, _
} = require('zaccaria-cli')

let yaml = require('js-yaml').safeLoad;
let liquid = require('liquid-node');

var getOptions = doc => {
    "use strict"
    var o = $d(doc)
    var help = $o('-h', '--help', false, o)
    var template = $o('-t', '--template', 'latex-jr', o);
    var latex = $o('-l', '--latex', false, o);
    var list = _.get(o, 'list', false)
    return {
        help, template, latex, list
    }
}

var main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        var {
            help, template, latex, list
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            if(list) {
                console.log("Available templates:");
                console.log($s.ls(`${__dirname}/templates`))
                process.exit(0);
            }
            $b.all([$r.stdin(), $f.readLocal(`templates/${template}`)]).spread((data, file) => {
                let engine = new liquid.Engine
                engine.parse(file).then((it) => {
                    return it.render(yaml(data));
                }).then((it) => {
                    if (latex) {
                        return withTmpDir((path) => {
                            console.log(`Using temporary ${path}`)
                            let cwd = process.cwd();
                            console.log(`Called from ${cwd} - using the same directory for storing file output`)
                            let file = `${path}/file.tex`;

                            it.to(file);
                            $s.cd(path);
                            $s.cp(__dirname+'/latex-classes/*', path)
                            let compile = () => {
                                console.log(`xelatex ${file}`);
                                return $s.execAsync(`xelatex ${file}`, { silent: true })
                            }
                            return compile().then(compile).then(() => {
                                $s.cp('-f', 'file.pdf', `${cwd}/resume.pdf`);
                            })
                        }, { unsafeCleanup: true })
                    }
                })
            })
        }
    })
}

main()
