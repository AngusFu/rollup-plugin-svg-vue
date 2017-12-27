const { basename } = require('path')
const { readFile } = require('fs-extra')
const { compiler } = require('vueify')
const { createFilter } = require('rollup-pluginutils')

const wrapCompiled = function ({ result, name }) {
  return `export default (function (module) {
  ${result}
  return module.exports;
})({exports: {
  name: ${name}
}});`
}

module.exports = ({ include, exclude } = {}) => {
  const filter = createFilter(include, exclude)

  return {
    load (id) {
      if (!filter(id) || !/.svg$/.test(id)) {
        return
      }

      return readFile(id, 'utf-8')
        .then(source => {
          if (source.trim() === '') {
            throw new Error(`Empty svg: ${id}`)
          }
          return source
        })
        .then(source => `<template>${source}</template>`)
        .then(template => compilePromise(template, id))
        .then(result => {
          return wrapCompiled({
            result,
            name: basename(id, '.svg')
          })
        })
    }
  }
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
