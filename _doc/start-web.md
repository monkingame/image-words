<!-- start web -->

## start web client manual

- install&setup www server   
likes nginx etc.

- enable https   
apple ATS needed

- cd web work dir   
  run the scripts to build web client   
  ```
  #!/bin/bash
  cd ~/your-work-dir/web
  yarn build
  cd ~/your-work-dir/web/build
  zip -r -q ~/publish/web.zip ~/your-publish-dir
  echo web.zip archived
  ```

- unzip web.zip to nginx dir, scripts maybe like this:   
  ```
  unzip web.zip -d web
  mv web ~/your-web-root-dir/web
  ```
  then ~/your-web-root-dir/web will be the root dir for web server
  
- restart nginx server
  