/* eslint quotes: [0], strict: [0] */
var {
    $d, $o, $f, $r, $b, withTmpDir, $s, _, $fs
} = require('zaccaria-cli')

let debug = require('debug')('yaml2resume')
let Promise = $b
let path = require('path')


let yaml = require('js-yaml').safeLoad;
let liquid = require('liquid-node');

var getOptions = doc => {
    "use strict"
    var o = $d(doc)
    var help = $o('-h', '--help', false, o)
    var template = $o('-t', '--template', 'latex-jr', o);
    var latex = $o('-l', '--latex', false, o);
    var json = $o('-j', '--json', false, o);
    var c = template.charAt(0)
    var isAbsolute = (c !== '.') || ( c !== '/')
    var list = _.get(o, 'list', false)
    return {
        help, template, latex, list, json, isAbsolute
    }
}


let myFilters = {
    sortBy: (input, key) => {
        return _.sortBy(input, key);
    }
}

class CustomFileSystem extends liquid.BlankFileSystem {

    readTemplateFile(pth) {
        let fileName = path.resolve(`${process.cwd()}/includes/${pth}.liquid`);
        return $fs.readFileAsync(fileName, 'utf-8');
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
            debug("Parsing options");
            if (list) {
                console.log("Available templates:");
                console.log($s.ls(`${__dirname}/templates`))
                process.exit(0);
            }
            let filePromise;
            if (isAbsolute) {
                debug("Absolute path template detected");
                filePromise = $fs.readFileAsync(template, 'utf-8')
            } else {
                debug("Normal path template filename ");
                filePromise = $f.readLocal(`templates/${template}`)
            }
            $b.all([$r.stdin(), filePromise]).spread((data, file) => {

                let engine = new liquid.Engine
                engine.fileSystem = new CustomFileSystem
                engine.registerFilters(myFilters)
                if (json) {
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
                            $s.cp(__dirname + '/latex-classes/*', path)
                            let compile = () => {
                                console.log(`xelatex ${file}`);
                                return $s.execAsync(`xelatex ${file}`, {
                                    silent: true
                                })
                            }
                            return compile().then(compile).then(() => {
                                $s.cp('-f', 'file.pdf', `${cwd}/resume.pdf`);
                            })
                        }, {
                            unsafeCleanup: true
                        })
                    } else {
                        console.log(it);
                    }
                }).catch((err) => {
                    console.log(`Error: ${err}`);
                })
            })
        }
    })
}

main()
