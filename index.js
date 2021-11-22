// "python3 -m http.server" in terminal to run
let invalid = "invalid"

d3
.select('h1')
.style('font-size', '40px')
.style('color', '#f6f3fc');


var userString = "";
var termSymbols = ["+", "-", "*"]

function inputCommit() {
    var input = document.getElementById("userInput").value;
    userString = input;
    document.getElementById("userInput").value = "";
    let valid = tokenize(userString);
    document.getElementById("userString").innerHTML = userString;
    //d3.select('b').style('color', 'red');

    if (valid) {
        let tree = parseExpr(userString.split(" ").filter(e => e))[0]
        createTree(tree);
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false 
    return !isNaN(str) && 
            /^\d+$/.test(str) &&
           !isNaN(parseFloat(str))
}

function tokenize(input) {
    var ls = input.split(" ").filter(e => e);
    var valid = true;
    for (i in ls) {
        if (termSymbols.includes(ls[i]) || isNumeric(ls[i])) continue;
        else {
            userString = userString.replace(ls[i], '<b class="error">' + ls[i] + '</b>');
            console.log("Invalid token: " + ls[i]);
            valid = false;
        }
    }
    return valid;
}

function parseExpr(tokens) {
    if (tokens === []) return [{name: "", concatName: "", invalid: true},[]] // Error??

    switch (tokens[0]) {
        case "*":
            let resM = parseExpr(tokens.slice(1))
            //if (resM[0].name === invalid) return [null, []]
            
            let resM2 = parseExpr(resM[1])
            //if (resM2[0] === null) return [null, []]
            //else {
                return [{
                    name: "*",
                    concatName: "*",
                    children: [
                        resM[0],
                        resM2[0]
                    ]}, resM2[1]]
            //}
            break;
        case "+":
            let resA = parseExpr(tokens.slice(1))
            //if (resA[0] === null) return [null, []]
            
            let resA2 = parseExpr(resA[1])
            //if (resA2[0] === null) return [null, []]
            //else {
                return [{
                    name: "+",
                    concatName: "+",
                    children: [
                        resA[0],
                        resA2[0]
                    ]}, resA2[1]]
            //}
            break;
        case "-":
            let resS = parseExpr(tokens.slice(1))
            //if (resS[0] === null) return [null, []]
            
            let resS2 = parseExpr(resS[1])
            //if (resS2[0] === null) return [null, []]
            //else {
                return [{
                    name: "-",
                    concatName: "-",
                    children: [
                        resS[0],
                        resS2[0]
                    ]}, resS2[1]]
            //}
            break;
        default:
            if (isNumeric(tokens[0])) {
                return [{
                    name: String(tokens[0]),
                    concatName: String(tokens[0])
                }, tokens.slice(1)]
            }
            else {
                return [{name: "", concatName: "", invalid: true}, tokens.slice(1)]
            }
            break;
    }
}


function concatNames(subRoot, cName) {
    fullName = cName ? subRoot.concatName : subRoot.name;
    if (subRoot.children) {
        subRoot.children.forEach(child => {
            fullName += " " + concatNames(child, true)
        });
    }
    return fullName

}