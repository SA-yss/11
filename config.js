/* config.js - OneSignal 초기화 */

window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: "ef0e8e78-9ec6-4e92-8bed-9f1eff07b903",
      });
    });
