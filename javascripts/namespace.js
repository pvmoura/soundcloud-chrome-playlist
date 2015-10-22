(function() {
  window.soundCloudApp = {};
  soundCloudApp.errorLog = {
    unloadedFiles: [],
    APIErrors: []
  };
  soundCloudApp.dependentFiles = {
    utilities: ['controllers', 'main', 'viewLogic'],
    viewLogic: ['main']
  };
  soundCloudApp.loadFile = function (fileName) {
    var script = document.createElement("script"),
        head = document.getElementsByTagName("head")[0];
    script.src = fileName;
    script.type = "text/javascript";
    head.appendChild(script);
  };
})();