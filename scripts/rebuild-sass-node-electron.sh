export npm_config_target=1.4.6
export npm_config_arch=x64
export npm_config_disturl=https://atom.io/download/atom-shell
export npm_config_runtime=electron
export npm_config_build_from_source=true

cd node_modules/node-sass
rm -fr vendor/darwin-x64-48/binding.node
HOME=~/.electron-gyp npm run build
cd ../..
mkdir -p vendor/darwin-x64-50
mv vendor/darwin-x64-51/binding.node vendor/darwin-x64-50/binding.node


cd out/node_modules/node-sass
rm -fr vendor/darwin-x64-48/binding.node
HOME=~/.electron-gyp npm run build
cd ../../..
mkdir -p vendor/darwin-x64-50
mv vendor/darwin-x64-51/binding.node vendor/darwin-x64-50/binding.node