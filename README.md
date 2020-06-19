# STL to OpenSCAD Converter

This tool allows you to convert .STLs to .SCADs with ease.
 
based on

STL to OpenSCAD Converter
http://jsfiddle.net/roha/353r2k8w/embedded/result/
From:
https://www.thingiverse.com/thing:1383325

Added file verification, styling, fixed typos, updated jquery, included all references properly, optimized code, removed deprecated references

Thingiverse use case:

In OpenSCAD you can use `import(example.stl)` to import an STL. However, Thingiverse Customizer doesn't support the `import` command, and it requires that everything resides in one .scad file. With this tool, you can convert all your STLs, then copy and paste each module to your main SCAD file.