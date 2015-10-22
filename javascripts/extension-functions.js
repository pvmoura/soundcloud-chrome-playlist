function saveSettings () {
  var settings = getById('settings'),
      children = settings.children,
      toSave = {};

  for (var i=0; i < children.length; i++) {
    toSave[children[i].id] = children[i].value;
  }
  chrome.storage.StorageArea.set({'settings': toSave}, function () {
    console.log("settings saved");
  };
}

function loadSettings () {
  chrome.storage.StorageArea.get('settings', function (returnedData) {
    var settings = returnedData['settings'],
        uiSettings = getById('settings'),
        elem;
    for (var key in settings) {
      elem = getById(key);
      elem.value = settings[key];
    }
  });
}