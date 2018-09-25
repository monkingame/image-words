<!-- start mobile -->

## start mobile client manual

- cd mobile work dir
  
- run mobile app with react-native command
  - react-native run-android
  - react-native run-ios

- if publish android apk, run the scripts:
```
#!/bin/bash
cd ~/your-work-dir/mobile
cd android
./gradlew clean
./gradlew assembleRelease
cp ./app/build/outputs/apk/release/app-release.apk ~/your-publish-dir/app.apk
echo mobile android apk build and copied OK
```

- if publish to iOS AppStore, some pre-build works need:   
[reference: Running on iOS device](https://facebook.github.io/react-native/docs/running-on-device.html)   
  - Enable App Transport Security(ATS)
  ```
    <dict>
      <key>NSAllowsArbitraryLoads</key>
      <true/>
      <key>NSExceptionDomains</key>
      <dict>
        <key>localhost</key>
        <dict>
          <key>NSExceptionAllowsInsecureHTTPLoads</key>
          <true/>
        </dict>
      </dict>
    </dict>
  ```
  remove/disable localhost NSExceptionAllowsInsecureHTTPLoads
  - Configure release scheme   
  go to Xcode: Product → Scheme → Edit Scheme.    
  Select the Run tab in the sidebar, then set the Build Configuration dropdown to Release.

  - Configure app to use static bundle   
  ```
    //for debug
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    //for release
    //   jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  ```
  comment debug codes and uncomment release codes

  - update main.jsbundle   
  ```
  react-native bundle --entry-file ./index.js --platform ios --bundle-output ios/main.jsbundle --assets-dest ios
  ```
  after re-created,import main.jsbundle to Xcode project again.

  - build&release, upload to AppStore.


