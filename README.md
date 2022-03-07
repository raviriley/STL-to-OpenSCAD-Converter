# [STL to OpenSCAD Converter](https://raviriley.github.io/STL-to-OpenSCAD-Converter/)

This tool allows you to convert .STLs to .SCADs with ease.
 
I based this on [STL to OpenSCAD Converter](http://jsfiddle.net/roha/353r2k8w/embedded/result/) from https://www.thingiverse.com/thing:1383325 but it had a lot of issues, so I added file verification, styling, fixed typos, updated dependencies, included all the references properly, fixed the errors, and removed deprecated code. 

#### Thingiverse use case:

In OpenSCAD you can use `import(example.stl)` to import an STL. However, Thingiverse Customizer doesn't support the `import` command, as it requires that everything resides in one .scad file. With this tool, you can convert all your STLs into OpenSCAD modules, copy and paste each module into one big SCAD file, and call the module instead of using `import()`.

If you use this please show it some love on Thingiverse: https://www.thingiverse.com/thing:4461877 or give the repo a star :) 
