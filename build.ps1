ng build ngx-natlang;
cp -r .\projects\ngx-natlang\bin .\dist\ngx-natural-language;
cd dist\ngx-natural-language;
npm publish;
cd ..\..;