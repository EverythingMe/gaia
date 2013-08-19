Evme.InstalledAppResult = function Evme_InstalledAppResult() {
  Evme.Result.call(this);
  this.type = Evme.RESULT_TYPE.INSTALLED;
}
Evme.InstalledAppResult.prototype = Object.create(Evme.Result.prototype);
Evme.InstalledAppResult.prototype.constructor = Evme.InstalledAppResult;

/*
  Renders installed apps
*/
Evme.InstalledAppsRenderer = function Evme_InstalledAppsRenderer() {
  var NAME = "InstalledAppsRenderer",
    DEFAULT_ICON = Evme.Utils.getDefaultAppIcon(),
    self = this,
    appsSignature = Evme.Utils.EMPTY_APPS_SIGNATURE,
    containerEl,
    containerSelector,
    filterResults;

  this.init = function init(cfg) {
    containerEl = cfg.containerEl;
    containerSelector = cfg.containerSelector;
    filterResults = cfg.filterResults;
  };

  this.render = function render(data) {
    var apps = Evme.InstalledAppsService.getMatchingApps(data),
      newSignature = Evme.Utils.getAppsSignature(apps);

    if (!apps || !apps.length) {
      self.clear();
      return;
    }

    if (appsSignature === newSignature) {
      Evme.Utils.log("InstalledAppsRenderer: nothing new to render (signatures match)");

    } else {
      self.clear();
      renderDocFrag(apps);
      appsSignature = newSignature;
    }
  };

  this.clear = function clear() {
    containerEl.innerHTML = '';
    appsSignature = Evme.Utils.EMPTY_APPS_SIGNATURE;

    // clear style
    filterResults && Evme.Utils.filterProviderResults({
      "id": 'installed'
    });
  };

  this.getResultCount = function getResultCount() {
    return containerEl.childElementCount;
  };

  function renderDocFrag(apps) {
    var docFrag = document.createDocumentFragment(),
        appUrls = [];

    for (var i = 0, app; app = apps[i++];) {
      var result = new Evme.InstalledAppResult(app.appUrl),
        el = result.init(app);

      result.draw(app.icon || DEFAULT_ICON);
      docFrag.appendChild(el);

      if (filterResults && 'appUrl' in app) {
        appUrls.push(app.appUrl);
      }
    }
    containerEl.appendChild(docFrag);

    filterResults && Evme.Utils.filterProviderResults({
      "id": 'installed',
      "attribute": 'data-url',
      "containerSelector": containerSelector,
      "items": appUrls
    });
  }
};

/*
Responsible for maintaining app indexes

App index - list of apps installed on device, including apps and bookmarks but *excluding* folders
[
  {app id}: {
    "name": {display name},
    "icon": {HTML element},
    "appUrl": {app url}
  },
  ...
]

 Query index - a mapping from experience name to app ids (manifestURLs or bookmarkURLs)
{
  "music": ["manifestURL1", "bookmarkURL1"],
  "top apps": ["manifestURL2", "bookmarkURL2"],
  "radio": ["manifestURL3", "bookmarkURL3"],
  ...
}
*/
Evme.InstalledAppsService = new function Evme_InstalledAppsService() {
  var NAME = "InstalledAppsService",
    self = this,
    appIndex = {}, APP_INDEX_STORAGE_KEY = NAME + "-app-index",
    queryIndex = {}, QUERY_INDEX_STORAGE_KEY = NAME + "-query-index";

  this.init = function init() {
    // create indexes
    createAppIndex();
    loadQueryIndex();

    // listeners
    window.addEventListener('appInstalled', onAppInstallChanged);
    window.addEventListener('appUninstalled', onAppInstallChanged);
  }

  this.requestAppsInfo = function requestAppsInfo() {
    var gridApps = Evme.Utils.sendToOS(Evme.Utils.OSMessages.GET_ALL_APPS),
      guids = gridApps.map(function getId(gridApp){
        return gridApp.manifestURL || gridApp.bookmarkURL;
      });

    Evme.EventHandler.trigger(NAME, "requestAppsInfo", guids);
  };

  this.requestAppsInfoCb = function requestAppsInfoCb(appsInfoFromAPI) {
    var slugs = [];

    queryIndex = {};

    for (var k in appsInfoFromAPI) {
      var appInfo = appsInfoFromAPI[k];

      // verify that the app info relates to an existing one in the appIndex
      var idInAppIndex = appInfo.guid;
      if (!(idInAppIndex in appIndex)) {
        continue;
      }

      // Store the marketplace api slug, in order to compare and dedup Marketplace app suggestions later on
      appIndex[idInAppIndex].slug = appInfo.nativeId;
      slugs.push(appInfo.nativeId);

      // queries is comprised of tags and experiences
      var tags = appInfo.tags || [],
        experiences = appInfo.experiences || [],
        queries = Evme.Utils.unique(tags.concat(experiences));

      // populate queryIndex
      for (var i = 0, query; query = queries[i++];) {
        query = normalizeQuery(query);
        if (!(query in queryIndex)) {
          queryIndex[query] = [];
        }
        queryIndex[query].push(idInAppIndex);
      }
    }

    Evme.Utils.filterProviderResults({
      "id": 'slugs',
      "attribute": 'data-slug',
      "containerSelector": '.installed',
      "items": slugs
    });

    Evme.Storage.set(QUERY_INDEX_STORAGE_KEY, queryIndex);
    Evme.EventHandler.trigger(NAME, "queryIndexUpdated");
  };

  this.getMatchingApps = function getMatchingApps(data) {
    if (!data || !data.query) {
      return [];
    }

    var matchingApps = [],
      query = normalizeQuery(data.query);

    // search appIndex
    // search query within first letters of app name words
    var regex = new RegExp('\\b' + query, 'i');
    for (var appId in appIndex) {
      // if there's a match, add to matchingApps
      var app = appIndex[appId];
      if ("name" in app && regex.test(app.name)) {
        matchingApps.push(app);
      }
    }

    // search query
    // search for only exact query match
    if (query in queryIndex) {
      for (var i = 0, appId; appId = queryIndex[query][i++];) {
        if (appId in appIndex) {
          var app = appIndex[appId];
          matchingApps.push(app);
        }
      }
    }

    matchingApps = Evme.Utils.unique(matchingApps, 'id');

    return matchingApps;
  };


  this.getAppById = function getAppById(appId) {
    return (appId in appIndex) && appIndex[appId];
  };

  this.getApps = function() {
    return appIndex;
  };

  this.getSlugs = function getAPIIds() {
    var ids = [];
    for (var id in appIndex) {
      var app = appIndex[id];
      app.slug && ids.push(app.slug);
    }
    return ids;
  };

  function onAppInstallChanged() {
    createAppIndex();
    self.requestAppsInfo();
  }

  function createAppIndex() {
    // empty current index and create a new one
    appIndex = {};

    var gridApps = Evme.Utils.sendToOS(Evme.Utils.OSMessages.GET_ALL_APPS);

    for (var i = 0, gridApp; gridApp = gridApps[i++];) {
      var appInfo = EvmeManager.getAppInfo(gridApp, function onAppInfo(appInfo){
        appIndex[appInfo.id] = appInfo;
      });
    }
  }

  function loadQueryIndex() {
    Evme.Storage.get(QUERY_INDEX_STORAGE_KEY, function queryIndexCb(queryIndexFromStorage) {
      if (queryIndexFromStorage) {
        queryIndex = queryIndexFromStorage;
      } else {
        self.requestAppsInfo();
      }
    });
  }
  
  function normalizeQuery(query) {
    return Evme.Utils.escapeRegexp(query.toLowerCase());
  }
};