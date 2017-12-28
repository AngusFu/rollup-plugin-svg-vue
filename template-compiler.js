// FROM https://github.com/vuejs/vueify/blob/master/lib/template-compiler.js
const vueCompiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')

module.exports = function compileTemplate (template) {
  const compiled = vueCompiler.compile(template)
  if (compiled.errors.length) {
    compiled.errors.forEach(function (msg) {
      console.error('\n' + msg + '\n')
    })
    throw new Error('Vue template compilation failed')
  } else {
    return {
      render: toFunction(compiled.render),
      staticRenderFns: '[' + compiled.staticRenderFns.map(toFunction).join(',') + ']'
    }
  }
}

function toFunction (code) {
  return transpile('function render () {' + code + '}')
}
