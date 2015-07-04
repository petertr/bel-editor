
var editor = document.getElementById("editArea");
var updateView = document.getElementById("updateView");

var bnd;


CodeMirror.defineSimpleMode("simplemode", {

  start: [

    {regex: /"(?:[^\\]|\\.)*?"/, token: "string"},

    {regex: /(function)(\s+)([a-z$][\w$]*)/,
     token: ["keyword", null, "variable-2"]},

    {regex: /(?:Domain|Title|Parametric|Explicit|Segment|ratio|decomposition|from|to|elements|part)\b/,
     token: "keyword"},
    {regex: /2D|3D|&|in/, token: "atom"},
    {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
     token: "number"},
    {regex: /\/\/.*/, token: "comment"},
    {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},

    {regex: /\/\*/, token: "comment", next: "comment"},
    {regex: /[-+\/*=<>!]+/, token: "operator"},

    {regex: /[\{\[\(]/, indent: true},
    {regex: /[\}\]\)]/, dedent: true},
    {regex: /[A-Z$][\w$]*/, token: "variable"},

    {regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
  ],

  comment: [
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],

  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
});

var CodeMirror = CodeMirror( editor, {
  value: "",
  mode:  "simplemode",
  theme: "ambiance",
  lineNumbers: true,
  lineWrapping: true
});

CodeMirror.setValue( ""); 

function parseBEL(data){

	var s, ex=[];
	s=Translate(data);
	bnd = s; 

	s = s.substring(s.indexOf("\n") + 1);	

	var test = /-?[0-9]+(\.[0-9]+)?([Ee][+-]?[0-9]+)?/gm;
	ex = s.match(test);

  console.log(ex);

	return ex;
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    
    for (var i = 0, f; f = files[i]; i++) {

      var reader = new FileReader();

 	    reader.readAsText(f);


      reader.onloadend = (function(theFile) {
        return function(e) {
          
			//editor.value = reader.result + "\n";
			CodeMirror.setValue( reader.result + "\n"); 
			reset();
			toMesh(parseBEL(reader.result));
        };
      })(f);

      reader.onerror = (function(theFile) {
        return function(e) {
        	console.log(reader.error);
        };
      })(f);

      
    }
  }


function expBND(){
	event.preventDefault();
	var blob = new Blob([bnd.toString()], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "test.bnd");
}

function expSTL(){
	event.preventDefault();
	alert("Saving STL!");
}

updateView.addEventListener("submit", function(event) {
	event.preventDefault();
	toMesh(parseBEL(CodeMirror.getValue()));
}, false);

function updateV(){
	reset();
	toMesh(parseBEL(CodeMirror.getValue()));
}


document.getElementById('files').addEventListener('change', handleFileSelect, false);
