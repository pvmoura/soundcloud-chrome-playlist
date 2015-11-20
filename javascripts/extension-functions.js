(function () {
  var getById = this.utils.getById;

  this.persistence = {

    saveSetting: function (id, value) {
      if (typeof value === 'undefined') {
        var elem = getById(id),
            value = elem.type === 'checkbox' ? elem.checked : elem.value;
      }

      chrome.storage.set({id: value}, function (response) {
        console.log(response);
      });
    }

    ,loadSetting: function (id, success) {
      if (typeof id !== 'string') return;

      chrome.storage.get(id, function (data) {
        return data;
      }
    }

    ,saveAllSettings: function () {
    var settings = getById('settings'),
        children = settings.children, child,
        toSave = {};

    for (var i=0; i < children.length; i++) {
      child = children[i];
      toSave[child.id] = child.type === 'checkbox' ? child.checked : child.value;
    }
    chrome.storage.set(toSave, function () {
      console.log("settings saved");
    };
  }

  ,loadAllSettings: function () {
    chrome.storage.get(null, function (returnedData) {
      var settings = returnedData['settings'],
          uiSettings = getById('settings'),
          elem;

      for (var key in settings) {
        elem = getById(key);
        if (elem.type === 'checkbox')
          elem.checked = settings[key];
        else
          elem.value = settings[key];
      }
    });
  }
}).apply(soundCloudApp);