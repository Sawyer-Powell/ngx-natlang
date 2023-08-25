cd ~/dev/personal/ngx-natlang
ng build;
cp -r projects/ngx-natlang/bin dist/ngx-natural-language;
cd dist/ngx-natural-language;
rm ~/dev/personal/ngx-natural-language-*.tgz
npm pack --pack-destination ~/dev/personal;
cd ~/dev/personal/ngx-natlang-test;
npm uninstall ngx-natural-language;
npm install ~/dev/personal/ngx-natural-language-*.tgz;
rm -rf .angular
cd ~/dev/personal/ngx-natlang;
