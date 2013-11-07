(function (document, window) {
  "use strict"
    
  /* XMLHTTPRequest handler */
  var XHR = (function () {
    var self = { }
  
    self.getJSON = function (location, callback) {
      var xhr = new XMLHttpRequest()
    
      xhr.overrideMimeType('application/json')
      xhr.open('GET', location, true)
    
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == '200') {
          var json = JSON.parse(xhr.responseText)

          callback(json)
        }
      }
    
      xhr.send(null)
    }
  
    return self
  })()

  /* Application handler */
  var Application = (function (XHR) {
    var self = { }
    
    self.library = [];
  
    self.initialize = function () {
      self.loadLibrary()
      
      document.getElementsByTagName('input')[0].onkeyup = function (event) {
        self.filterLibrary(this.value)
      }
    }
    
    self.hasApplicationHashTag = function () {
      return window.location.hash !== ""
    }
    
    self.parseApplicationHashTag = function () {
      var application = window.location.hash.substr(1, window.location.hash.length - 1)
      
      for (var i = 0; i < self.library.length; i++) {
        var record = self.library[i]
        
        if (record.identifier === application) {
          document.body.setAttribute('id', 'app-view')
          
          var article = document.createElement('article')
          var div = document.createElement('div')
          var heading = document.createElement('h1')
          var headingContent = document.createTextNode('Download ' + record.application)
          var paragraph = document.createElement('p')
          var macLink = document.createElement('a')
          var macIcon = document.createElement('i')
          var windowsLink = document.createElement('a')
          var windowsIcon = document.createElement('i')
          var linuxLink = document.createElement('a')
          var linuxIcon = document.createElement('i')
          var closeLink = document.createElement('a')
          var closeIcon = document.createElement('i')
          
          if (typeof record.queries.mac !== 'undefined') {
            macLink.setAttribute('href', '#')
            macLink.appendChild(macIcon)
            
            if (window.navigator.userAgent.match(/mac/i)) {
              macLink.className = 'active'
            }
            
            macIcon.className = "fa fa-apple fa-4x"
            
            paragraph.appendChild(macLink)
            
            self.bindLinkToDownloadQuery(macLink, record.queries.mac)
          }
          
          if (typeof record.queries.windows !== 'undefined') {
            windowsLink.setAttribute('href', '#')
            windowsLink.appendChild(windowsIcon)
            
            if (window.navigator.userAgent.match(/win/i)) {
              windowsLink.className = 'active'
            }
            
            windowsIcon.className = "fa fa-windows fa-4x"
            
            paragraph.appendChild(windowsLink)
            
            self.bindLinkToDownloadQuery(windowsLink, record.queries.windows)
          }
          
          if (typeof record.queries.linux !== 'undefined') {
            linuxLink.setAttribute('href', '#')
            linuxLink.appendChild(linuxIcon)
            
            if (window.navigator.userAgent.match(/linux/i)) {
              linuxLink.className = 'active'
            }
            
            linuxIcon.className = "fa fa-linux fa-4x"
            
            paragraph.appendChild(linuxLink)
            
            self.bindLinkToDownloadQuery(linuxLink, record.queries.linux)
          }
          
          closeLink.setAttribute('href', '#')
          closeLink.onclick = function (event) {
            event.preventDefault()
            
            document.body.setAttribute('id', '')
            
            setTimeout(function () {
              document.body.removeChild(document.body.lastChild)
            }, 1000)
          }
          
          article.appendChild(closeLink)
          article.appendChild(heading)
          article.appendChild(paragraph)
          
          heading.appendChild(headingContent)
          
          document.body.appendChild(article)
          
          if (typeof record.information.wikipedia !== 'undefined') {
            var wikipediaAside = document.createElement('aside')
            
            wikipediaAside.className = 'loading'
            article.appendChild(wikipediaAside)
            
            self.getWikipediaIntro(record.information.wikipedia, function (json) {
              var wikipediaAside = document.body.lastChild.lastChild
              var wikipediaHeading = document.createElement('h2')
              
              wikipediaHeading.appendChild(document.createTextNode('Wikipedia'))
              
              wikipediaAside.className = ''
              wikipediaAside.innerHTML = json.query.results
              wikipediaAside.appendChild(wikipediaHeading)
              
              console.log(json.query.results)
            })
          }
          
          break
        }
        else if (i === self.library.length - 1) {
          document.body.setAttribute('id', '')
        }
      }
    }
    
    self.bindLinkToDownloadQuery = function (link, query) {
      link.onclick = function (event) {
        event.preventDefault()

        if (this.className !== 'disabled') {
          this.className = 'disabled'
          
          self.runYQLQuery(query, function (json) {
            document.getElementsByClassName('disabled')[0].className = ''
            
            window.location = json.query.results.a.href
          })
        }
      }
    }
    
    self.getWikipediaIntro = function (title, callback) {
      var query;
      query = "select * from xml where url='"
      query += "http://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&format=xml&titles="
      query += encodeURIComponent(title)
      query += "' and itemPath='//extract/text()'"
      
      self.runYQLQuery(query, callback)
    }
    
    self.runYQLQuery = function (query, callback) {
      var uri = self.createYQLURI(query);
      
      XHR.getJSON(uri, callback)
    }
    
    self.createYQLURI = function(query) {
      return "http://query.yahooapis.com/v1/public/yql?callback=&format=json&q=" + encodeURIComponent(query);
    }
  
    self.loadLibrary = function () {
      XHR.getJSON('library.json', function(json) {
        self.populateLibrary(json.library)
        
        if (self.hasApplicationHashTag()) {
          self.parseApplicationHashTag()
        }
      })
    }
    
    self.filterLibrary = function (query) {
      for (var i = 0; i < self.library.length; i++) {
        var record = self.library[i]
        var expression = new RegExp('' + query + '', 'i')
        var input = document.getElementById(record.identifier)
        var article = input.parentElement.parentElement.parentElement
        
        if (record.identifier.match(expression) || record.application.match(expression) || record.developer.match(expression)) {
          article.className = ''
        } else {
          article.className = 'hidden'
        }
      }
    }
    
    self.populateLibrary = function (library) {
      self.library = library;
      
      for (var i = 0; i < library.length; i++) {
        var article = document.createElement('article')
        var div = document.createElement('div')
        var header = document.createElement('header')
        var heading = document.createElement('h1')
        var headingContent = document.createTextNode(library[i].application)
        var openLink = document.createElement('a')
        var shareLink = document.createElement('a')
        var ratingIcon = document.createElement('i')
        var aside = document.createElement('aside')
        var paragraph = document.createElement('p')
        var input = document.createElement('input')
        
        input.value = 'jolt@' + library[i].identifier
        input.setAttribute('type', 'text')
        input.id = library[i].identifier
        
        input.onfocus = function () {
          this.value = 'http://jolt.at#' + this.id
        }
        
        input.onblur = function () {
          this.value = 'jolt@' + this.id
        }
        
        input.onclick = input.ontouchstart = function () {
          this.select()
        }
        
        article.setAttribute('ontouchstart', 'this.classList.toggle("hover");')
        
        header.appendChild(heading)
        header.appendChild(aside)
        
        for (var x = 0; x < library[i].labels.length; x++) {
          var label = document.createElement('label')
          var labelContent = document.createTextNode(library[i].labels[x])
          
          label.appendChild(labelContent)
          aside.appendChild(label)
        }
        
        heading.appendChild(headingContent)
        
        openLink.className = 'fa fa-globe'
        openLink.href = 'http://jolt.at#' + library[i].identifier
        
        shareLink.className = 'fa fa-envelope'
        shareLink.href = 'mailto:?subject=Link to download%20' + library[i].application + '&body=Hello,%0A%0ADownload%20' + library[i].application + '%20at:%20http://jolt.at#' + library[i].identifier
        
        paragraph.appendChild(openLink)
        paragraph.appendChild(shareLink)
        paragraph.appendChild(input)
        
        if (typeof library[i].rating !== 'undefined') {
          ratingIcon.className = 'fa fa-circle rating-' + library[i].rating
          
          paragraph.appendChild(ratingIcon)
        }
        
        div.appendChild(header)
        div.appendChild(paragraph)
        
        article.appendChild(div)
        
        document.getElementsByTagName('section')[0].appendChild(article)
      }
    }
  
    return self
  })(XHR)
  
  Application.initialize()
})(document, window)