ng build;
cp -r ./projects/ngx-natlang/bin ./dist/ngx-natural-language;
cd dist/ngx-natural-language;
npm pack --pack-destination ~/dev/personal;
cd ~/dev/personal/ngx-natlang-test;
npm uninstall ngx-natural-language;
npm install ~/dev/personal/ngx-natural-language-0.1.4.tgz;
rm -rf .angular
cd ~/dev/personal/ngx-natlang;
