/* eslint quotes: [0], strict: [0] */
var {
    $d, $o, $f, $r, $b, withTmpDir, $s, _, $fs
} = require('zaccaria-cli')

let yaml = require('js-yaml').safeLoad;
let liquid = require('liquid-node');

var getOptions = doc => {
    "use strict"
    var o = $d(doc)
    var help = $o('-h', '--help', false, o)
    var template = $o('-t', '--template', 'latex-jr', o);
    var latex = $o('-l', '--latex', false, o);
    var json = $o('-j', '--json', false, o);
    var isAbsolute = template.charAt(0) == '.' || template.charAt(0) == '/';
    var list = _.get(o, 'list', false)
    return {
        help, template, latex, list, json, isAbsolute
    }
}

var main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        var {
            help, template, latex, list, json, isAbsolute
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            if(list) {
                console.log("Available templates:");
                console.log($s.ls(`${__dirname}/templates`))
                process.exit(0);
            }
            let filePromise;
            if(isAbsolute) {
                filePromise = $fs.readFileAsync(template, 'utf-8')
            } else {
                filePromise = $f.readLocal(`templates/${template}`)
            }
            $b.all([$r.stdin(), filePromise]).spread((data, file) => {
                let engine = new liquid.Engine
                if(json) {
                    data = JSON.parse(data)
                } else {
                    data = yaml(data);
                }
                engine.parse(file).then((it) => {
                    return it.render(data);
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
