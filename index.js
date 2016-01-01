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
var _ = _require._;
var $fs = _require.$fs;

var yaml = require("js-yaml").safeLoad;
var liquid = require("liquid-node");

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var template = $o("-t", "--template", "latex-jr", o);
    var latex = $o("-l", "--latex", false, o);
    var json = $o("-j", "--json", false, o);
    var isAbsolute = template.charAt(0) == "." || template.charAt(0) == "/";
    var list = _.get(o, "list", false);
    return {
        help: help, template: template, latex: latex, list: list, json: json, isAbsolute: isAbsolute
    };
};

var main = function () {
    $f.readLocal("docs/usage.md").then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var template = _getOptions.template;
        var latex = _getOptions.latex;
        var list = _getOptions.list;
        var json = _getOptions.json;
        var isAbsolute = _getOptions.isAbsolute;

        if (help) {
            console.log(it);
        } else {
            if (list) {
                console.log("Available templates:");
                console.log($s.ls("" + __dirname + "/templates"));
                process.exit(0);
            }
            var filePromise = undefined;
            if (isAbsolute) {
                filePromise = $fs.readFileAsync(template, "utf-8");
            } else {
                filePromise = $f.readLocal("templates/" + template);
            }
            $b.all([$r.stdin(), filePromise]).spread(function (data, file) {
                var engine = new liquid.Engine();
                if (json) {
                    data = JSON.parse(data);
                } else {
                    data = yaml(data);
                }
                engine.parse(file).then(function (it) {
                    return it.render(data);
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
                    }
                });
            });
        }
    });
};

main();
