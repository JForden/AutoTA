function test() {
    //var fs = require("fs"),obj
    var ErrNum=0;
    const linearray=[];
    //var txt = '{"type": "convention","module": "realmidterm","obj": "","line": 7,"column": 16,"path": "realmidterm.py","symbol": "trailing-whitespace","message": "Trailing whitespace","message-id": "C0303"}'
    //var data = JSON.parse(txt);
    //push(document.getElementById("?") = data.line);
    var filedata = [
        {
            "type": "convention",
            "module": "realmidterm",
            "obj": "",
            "line": 7,
            "column": 16,
            "path": "realmidterm.py",
            "symbol": "trailing-whitespace",
            "message": "Trailing whitespace",
            "message-id": "C0303"
        },
        {
            "type": "convention",
            "module": "realmidterm",
            "obj": "",
            "line": 8,
            "column": 21,
            "path": "realmidterm.py",
            "symbol": "trailing-whitespace",
            "message": "Trailing whitespace",
            "message-id": "C0303"
        },
        {
            "type": "convention",
            "module": "realmidterm",
            "obj": "product",
            "line": 21,
            "column": 0,
            "path": "realmidterm.py",
            "symbol": "missing-function-docstring",
            "message": "Missing function or method docstring",
            "message-id": "C0116"
        }
    ];

    for(const [key,value] of Object.entries(filedata)){
            linearray.push(value.line);
    };
    document.querySelectorAll('[data-line-number="value"]');

    var dynmiclines = document.getElementsByClassName("hljs-ln-n");
    
    for(var i =0; i < linearray.length; i++){
        dynmiclines[linearray[i]].style.background ="yellow";
    }
    


}


