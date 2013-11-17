
/* globals stylus: true, jade: true, angular: true */

var xon = require('xon')

module.exports = Manager;

function compileXon(txt) {
  /* jshint -W054: false */
  var data = new Function('x', txt)(xon)
  return xon(data)
}

function Manager(document, fetcher){
  var els = {}
    , data = {
        js: '',
        styl: '',
        xon: '',
        jade: ''
      }
  ;['output',
    'injected-css'].map(function (id) {
    els[id] = document.getElementById(id)
  })
  this.els = els
  this.data = data
  this.fetcher = fetcher
  this.lastXon = null
}

Manager.prototype = {
  html: function (txt) {
    if (arguments.length === 0) return this.data.html
    var parent = this.els.output.parentNode
      , html
    try {
      html = jade.compile(txt)()
    } catch (e) {
      return
    }
    this.data.jade = txt
    parent.innerHTML = '<div id="output">' + html + '</div>'
    angular.bootstrap((this.els.output = parent.firstChild), ['MyApp'])
  },
  styl: function (txt) {
    var self = this
    txt = '#output\n  ' + txt.replace(/\n/g,'\n  ')
    stylus(txt).render(function (err, css) {
      if (!css) return
      self.data.styl = txt
      self.els['injected-css'].innerHTML = css
    })
  },
  xon: function (txt, cb) {
    if (arguments.length === 0) return this.data.xon
    if (cb) this.fetcher = cb
    if (!txt && cb) {
      if (this.lastXon) return cb(this.lastXon, true)
      txt = this.data.xon
    }
    var data
    try {
      data = compileXon(txt)
    } catch (e) {
      return
    }
    this.data.xon = txt
    this.lastXon = data
    if (this.fetcher) {
      this.fetcher(data, !!cb)
    }
  }
}