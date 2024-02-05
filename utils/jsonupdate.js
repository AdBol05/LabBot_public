let args = process.argv.splice(2);

function convert(input){
    let data = {
        name: "",
        displayName: "",
        description: "",
        storage: {
            content: "",
            extra: "",
            id: ""
        },
        createdBy:{
            name: "",
            id: ""
        },
        URLs: []
    };
}

if(args[0] === "--directory" || args[0] === "--dir" || args[0] === "-d"){

}