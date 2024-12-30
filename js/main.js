//STL to OpenSCAD converter
//This code will read an STL file and Generate an OpenSCAD file based on the content
//it supports both ASCII and Binary STL files.

var reader;
var progress = document.querySelector('.percent');
var vertices = [];
var triangles = [];
var modules = '';
var calls = '';
var functions = '';
var vertexIndex = 0;
var converted = 0;
var totalObjects = 0;
var convertedObjects = 0;
var fileName = '';

function _reset() {
  vertices = [];
  triangles = [];
  modules = '';
  calls = '';
  functions = '';
  vertexIndex = 0;
  converted = 0;
  totalObjects = 0;
  document.getElementById('error').innerText = '';
  document.getElementById('conversion').innerText = '';
  document.getElementById("download").style.display = "none"
}

//stl: the stl file context as a string
//parseResult: This function checks if the file is ASCII or Binary, and parses the file accordingly
function parseResult(stl) {
  _reset();
  var isAscii = true;

  for (var i = 0; i < stl.length; i++) {

    if (stl[i].charCodeAt(0) == 0) {
      isAscii = false;
      break;
    }
  }
  if (!isAscii) {
    parseBinaryResult(stl);
  } else {

    parseAsciiResult(stl);
  }
}

function parseBinaryResult(stl) {
  //This makes more sense if you read http://en.wikipedia.org/wiki/STL_(file_format)#Binary_STL
  var br = new BinaryReader(stl);
  br.seek(80); //Skip header
  var totalTriangles = br.readUInt32(); //Read # triangles

  var minx = Number.MAX_VALUE;
  var miny = Number.MAX_VALUE;
  var minz = Number.MAX_VALUE;
  var maxx = Number.MIN_VALUE;
  var maxy = Number.MIN_VALUE;
  var maxz = Number.MIN_VALUE;
  for (var tr = 0; tr < totalTriangles; tr++) {
    try {
      document.getElementById('conversion').innerText = 'In Progress - Converted ' + (++converted) + ' out of ' + totalTriangles + ' triangles!';
      /*
       REAL32[3] – Normal vector
       REAL32[3] – Vertex 1
       REAL32[3] – Vertex 2
       REAL32[3] – Vertex 3
       UINT16 – Attribute byte count*/
      //Skip Normal Vector;
      br.readFloat();
      br.readFloat();
      br.readFloat(); //SKIP NORMAL
      //Parse every 3 subsequent floats as a vertex

      var x1, y1, z1;
      var x2, y2, z2;
      var x3, y3, z3;
      x1 = br.readFloat();
      y1 = br.readFloat();
      z1 = br.readFloat();
      
      x2 = br.readFloat();
      y2 = br.readFloat();
      z2 = br.readFloat();
      
      x3 = br.readFloat();
      y3 = br.readFloat();
      z3 = br.readFloat();

      minx = Math.min(minx, x1, x2, x3);
      maxx = Math.max(maxx, x1, x2, x3);
      miny = Math.min(miny, y1, y2, y3);
      maxy = Math.max(maxy, y1, y2, y3);
      minz = Math.min(minz, z1, z2, z3);
      maxz = Math.max(maxz, z1, z2, z3);
            
      var v1 = '[' + x1 + ',' + y1 + ',' + z1 + ']';
      var v2 = '[' + x2 + ',' + y2 + ',' + z2 + ']';
      var v3 = '[' + x3 + ',' + y3 + ',' + z3 + ']';
      //every 3 vertices create a triangle.
      var triangle = '[' + (vertexIndex++) + ',' + (vertexIndex++) + ',' + (vertexIndex++) + ']';

      br.readUInt16();
      //Add 3 vertices for every triangle

      //TODO: OPTIMIZE: Check if the vertex is already in the array, if it is just reuse the index
      vertices.push(v1);
      vertices.push(v2);
      vertices.push(v3);
      triangles.push(triangle);
    } catch (err) {
      error(err);
      return;
    }
  }

  var boundsMin = `[${minx.toFixed(3)}, ${miny.toFixed(3)}, ${minz.toFixed(3)}]`;
  var boundsMax = `[${maxx.toFixed(3)}, ${maxy.toFixed(3)}, ${maxz.toFixed(3)}]`;
  saveResult(vertices, triangles, boundsMin, boundsMax);
}

function parseAsciiResult(stl) {

  //Find all models
  var objects = stl.split('endsolid');

  for (var o = 0; o < objects.length; o++) {

    //Translation: a non-greedy regex for loop {...} endloop pattern 
    var patt = /\bloop[\s\S]*?\endloop/mgi;
    var result = 'matches are: ';
    converted = 0;
    match = objects[o].match(patt);
    if (match == null) continue;

    var minx = Number.MAX_VALUE;
    var miny = Number.MAX_VALUE;
    var minz = Number.MAX_VALUE;
    var maxx = Number.MIN_VALUE;
    var maxy = Number.MIN_VALUE;
    var maxz = Number.MIN_VALUE;
    for (var i = 0; i < match.length; i++) {
      try {
        document.getElementById('conversion').innerText = 'In Progress - Object ' + (o + 1) + ' out of ' + objects.length + ' Converted ' + (++converted) + ' out of ' + match.length + ' facets!';

        //3 different vertex objects each with 3 numbers.
        var vpatt = /\bvertex\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s*vertex\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s*vertex\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s*/mgi;

        var v = vpatt.exec(match[i]);
        if (v == null) continue;

        if (v.length != 10) {
          document.getElementById('error').innerText = '\r\nFailed to parse ' + match[i];
          break;
        }

        var a1, a2, a3;
        a1 = parseFloat(v[1]);
        a2 = parseFloat(v[4]);
        a3 = parseFloat(v[7]);
        minx = Math.min(minx, a1, a2, a3);
        maxx = Math.max(maxx, a1, a2, a3);

        a1 = parseFloat(v[2]);
        a2 = parseFloat(v[5]);
        a3 = parseFloat(v[8]);
        miny = Math.min(miny, a1, a2, a3);
        maxy = Math.max(maxy, a1, a2, a3);

        a1 = parseFloat(v[3]);
        a2 = parseFloat(v[6]);
        a3 = parseFloat(v[9]);
        minz = Math.min(minz, a1, a2, a3);
        maxz = Math.max(maxz, a1, a2, a3);
        
        var v1 = '[' + v[1] + ',' + v[2] + ',' + v[3] + ']';
        var v2 = '[' + v[4] + ',' + v[5] + ',' + v[6] + ']';
        var v3 = '[' + v[7] + ',' + v[8] + ',' + v[9] + ']';
        var triangle = '[' + (vertexIndex++) + ',' + (vertexIndex++) + ',' + (vertexIndex++) + ']';
        //Add 3 vertices for every triangle

        //TODO: OPTIMIZE: Check if the vertex is already in the array, if it is just reuse the index
        vertices.push(v1);
        vertices.push(v2);
        vertices.push(v3);
        triangles.push(triangle);
      } catch (err) {
        error(err);
        return;
      }
    }

    var boundsMin = `[${minx.toFixed(3)}, ${miny.toFixed(3)}, ${minz.toFixed(3)}]`;
    var boundsMax = `[${maxx.toFixed(3)}, ${maxy.toFixed(3)}, ${maxz.toFixed(3)}]`;
    saveResult(vertices, triangles, boundsMin, boundsMax);
  }
}

function error(err) {
  document.getElementById('error').innerText = "An Error has occured while trying to convert your file!\r\nPlease make sure this is a valid STL file.";
  document.getElementById('conversion').innerText = '';
  document.getElementById("download").style.display = "none";
}
//Input: Set of vertices and triangles, both are strings
//Makes the Download link create an OpenScad file with a polyhedron object that represents the parsed stl file
function saveResult(vertices, triangles, boundsMin, boundsMax) {
  // this function groups an array 'a' in groups of 'n'
  const regroup = (a, n) => [...Array(Math.ceil(a.length / n))]
    .map((item, i) => a.slice(i*n, (i+1)*n));

  // creates the group of 3 of both arrays
  var verticesGroup = regroup(vertices, 3);
  var trianglesGroup = regroup(triangles, 3);

  // each line will be composed by three coordinates followed by the comma and the crlf
  var verticesString = verticesGroup.map(g => g.join(',')).join(',\r\n');
  var trianglesString = trianglesGroup.map(g => g.join(',')).join(',\r\n');

  var poly = 'polyhedron(\r\n points=[' + verticesString + ' ],\r\nfaces=[' + trianglesString + ']);';

  var objectName = `object${++totalObjects}`;
  var functionMin = `${objectName}Min()`;
  var functionMax = `${objectName}Max()`;

  functions = functions + `function ${functionMin} = ${boundsMin};\r\n`;
  functions = functions + `function ${functionMax} = ${boundsMax};\r\n\r\n`;

  modules = modules + 'module object' + totalObjects + '(scale) {';
  modules = modules + poly + '}\r\n\r\n';
  
  calls = calls + objectName + '(1);\r\n\r\n';

  result = modules + functions + calls;

  window.URL = window.URL || window.webkitURL;
  //prompt("Copy scad:", result); //prompt result in a copyable field
  var blob = new Blob([result], {
    type: 'text/plain'
  });

  $("#download").attr("href", window.URL.createObjectURL(blob));
  $("#download").attr("download", fileName + ".scad");

  document.getElementById("conversion").innerText = "Conversion complete. Click the button below to download your OpenSCAD file!";
  document.getElementById("triangles").innerText = "Total Triangles: " + triangles.length;
  document.getElementById("bounds").innerText = "Bounds: " + boundsMin + ", " + boundsMax;
  document.getElementById("download").style.display = "";
}

function errorHandler(evt) {
  switch (evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
      alert('File Not Found!');
      break;
    case evt.target.error.NOT_READABLE_ERR:
      alert('File is not readable');
      break;
    case evt.target.error.ABORT_ERR:
      break; // noop
    default:
      alert('An error occurred reading this file.');
  };
}

function updateProgress(evt) {
  // evt is an ProgressEvent.
  if (evt.lengthComputable) {
    var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
    // Increase the progress bar length.
    if (percentLoaded < 100) {
      progress.style.width = percentLoaded + '%';
      progress.textContent = percentLoaded + '%';
    }
  }
}


function handleFileSelect(evt) {
  // Reset progress indicator on new file selection.
  progress.style.width = '0%';
  progress.textContent = '0%';
  
  var nextFileName = evt.target.files[0].name;
  var extension = String(nextFileName.match(/\.[0-9a-z]+$/i));
  if (extension.toLowerCase() == ".stl") {
    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
      alert('File read cancelled');
    };
    reader.onloadstart = function(e) {
      document.getElementById('progress_bar').className = 'loading';
    };

    reader.onload = function(e) {
      // Ensure that the progress bar displays 100% at the end.
      progress.style.width = '100%';
      progress.textContent = '100%';
      setTimeout("document.getElementById('progress_bar').className='';", 2000);
      fileName = nextFileName;
      parseResult(reader.result);
  }

  // Read in the stl file as a binary string.
  reader.readAsBinaryString(evt.target.files[0]);
  }
  else
	  error();
}

function abortRead() {
  reader.abort();
}

document.getElementById("upload").addEventListener('change', handleFileSelect, false);
