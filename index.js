#!/usr/bin/env node
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/* eslint quotes: [0], strict: [0] */

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

var debug = require("debug")("yaml2resume");
var Promise = $b;
var path = require("path");

var yaml = require("js-yaml").safeLoad;
var liquid = require("liquid-node");

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var template = $o("-t", "--template", "latex-jr", o);
    var latex = $o("-l", "--latex", false, o);
    var json = $o("-j", "--json", false, o);
    var c = template.charAt(0);
    var isAbsolute = c !== "." || c !== "/";
    var list = _.get(o, "list", false);
    return {
        help: help, template: template, latex: latex, list: list, json: json, isAbsolute: isAbsolute
    };
};

var CustomFileSystem = (function (_liquid$BlankFileSystem) {
    function CustomFileSystem() {
        _classCallCheck(this, CustomFileSystem);

        if (_liquid$BlankFileSystem != null) {
            _liquid$BlankFileSystem.apply(this, arguments);
        }
    }

    _inherits(CustomFileSystem, _liquid$BlankFileSystem);

    _createClass(CustomFileSystem, {
        readTemplateFile: {
            value: function readTemplateFile(pth) {
                var fileName = path.resolve("" + process.cwd() + "/includes/" + pth + ".liquid");
                return $fs.readFileAsync(fileName, "utf-8");
            }
        }
    });

    return CustomFileSystem;
})(liquid.BlankFileSystem);

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
            debug("Parsing options");
            if (list) {
                console.log("Available templates:");
                console.log($s.ls("" + __dirname + "/templates"));
                process.exit(0);
            }
            var filePromise = undefined;
            if (isAbsolute) {
                debug("Absolute path template detected");
                filePromise = $fs.readFileAsync(template, "utf-8");
            } else {
                debug("Normal path template filename ");
                filePromise = $f.readLocal("templates/" + template);
            }
            $b.all([$r.stdin(), filePromise]).spread(function (data, file) {

                var engine = new liquid.Engine();
                engine.fileSystem = new CustomFileSystem();
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
                                return $s.execAsync("xelatex " + file, {
                                    silent: true
                                });
                            };
                            return compile().then(compile).then(function () {
                                $s.cp("-f", "file.pdf", "" + cwd + "/resume.pdf");
                            });
                        }, {
                            unsafeCleanup: true
                        });
                    } else {
                        console.log(it);
                    }
                })["catch"](function (err) {
                    console.log("Error: " + err);
                });
            });
        }
    });
};

main();
