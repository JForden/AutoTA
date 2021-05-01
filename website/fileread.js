function test(file) {
    const linearray=[];

    for(const [key,value] of Object.entries(file)){
            linearray.push(value.line);
    };
    document.querySelectorAll('[data-line-number="value"]');

    var dynmiclines = document.getElementsByClassName("hljs-ln-n");
    
    for(var i =0; i < linearray.length; i++){
        dynmiclines[linearray[i]-1].style.background ="yellow";
    }
}

