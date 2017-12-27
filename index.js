const { basename, resolve, dirname } = require('path')
const { readFile } = require('fs-extra')

const glob = require('glob')
const { compiler } = require('vueify')
const { createFilter } = require('rollup-pluginutils')

const wrapCompiled = function ({ result, name }) {
  return `(function (module) {
  ${result}
  return module.exports;
})({exports: {
  name: ${JSON.stringify(name)}
}})`
}

module.exports = ({ include, exclude } = {}) => {
  const filter = createFilter(include, exclude)
  const map = {}

  return {
    name: 'rollup-plugin-svg-vue',

    resolveId (importee, importer) {
      if (!filter(importee) || !/.svg$/.test(importee)) {
        return
      }

      const id = `$$SVG__${importee}`
      map[id] = { importee, importer }
      return id
    },

    load (id) {
      if (!map[id]) {
        return
      }

      const { importee, importer } = map[id]
      const cwd = dirname(importer)

      if (!/\*/.test(importee)) {
        const file = resolve(cwd, importee)
        return svg2vue(file)
          .then(code => `export default ${code}`)
      }

      const files = glob.sync(importee, { cwd })
      return Promise.all(
        files.map(file => svg2vue(resolve(cwd, file)))
      )
      .then(codes => `export default [\n${codes.join('\n,')}\n]`)
    }
  }
}

function svg2vue (file) {
  return readFile(file, 'utf-8')
    .then(source => {
      if (source.trim() === '') {
        throw new Error(`Empty svg: ${file}`)
      }
      return source
    })
    .then(source => `<template>${source}</template>`)
    .then(template => compilePromise(template, file))
    .then(result => {
      return wrapCompiled({
        result,
        name: basename(file, '.svg')
      })
    })
}

function compilePromise (code, path) {
  return new Promise((resolve, reject) => {
    compiler.compile(code, path, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
