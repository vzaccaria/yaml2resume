#!/usr/bin/env node
/* eslint quotes: [0], strict: [0] */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $r = _require.$r;
var $b = _require.$b;
var withTmpDir = _require.withTmpDir;
var $s = _require.$s;

var yaml = require("js-yaml").safeLoad;
var liquid = require("liquid-node");

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var template = $o("-t", "--template", "markdown", o);
    var latex = $o("-l", "--latex", false, o);
    return {
        help: help, template: template, latex: latex
    };
};

var main = function () {
    $f.readLocal("docs/usage.md").then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var template = _getOptions.template;
        var latex = _getOptions.latex;

        if (help) {
            console.log(it);
        } else {
            $b.all([$r.stdin(), $f.readLocal("templates/" + template)]).spread(function (data, file) {
                var engine = new liquid.Engine();
                engine.parse(file).then(function (it) {
                    return it.render(yaml(data));
                }).then(function (it) {
                    if (latex) {
                        return withTmpDir(function (path) {
                            console.log("Using temporary " + path);
                            var cwd = process.cwd();
                            console.log("Called from " + cwd + " - using the same directory for storing file output");
                            var file = "" + path + "/file.tex";

                            it.to(file);
                            $s.cd(path);
                            $s.cp(__dirname + "/latex-classes/*", path);
                            var compile = function () {
                                console.log("xelatex " + file);
                                return $s.execAsync("xelatex " + file, { silent: true });
                            };
                            return compile().then(compile).then(function () {
                                $s.cp("-f", "file.pdf", "" + cwd + "/resume.pdf");
                            });
                        }, { unsafeCleanup: true });
                    } else {
                        console.log(it);
                    }
                });
            });
        }
    });
};

main();
