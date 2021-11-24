// "python3 -m http.server" in terminal to run
let invalid = "invalid"

d3
.select('h1')
.style('font-size', '35px')
.style('color', '#f6f3fc')
.style('margin', '10px');


var userString = "";
var termSymbols = ["+", "-", "*"]

function inputCommit() {
    var input = document.getElementById("userInput").value;
    userString = input;
    document.getElementById("userInput").value = "";
    let valid = tokenize(userString);
    if (!valid) {
        document.getElementById("userString").innerHTML = "Cannot parse string with invalid tokens: " + userString;
    }
    if (valid) {
        let [b,tree] = parseExpr(userString.split(" ").filter(e => e))
        if (b) {
            document.getElementById("userString").innerHTML = "Parsing <b class='error'>invalid</b> string: " + userString;
        }
        else {
            document.getElementById("userString").innerHTML = "Parsing string: " + userString;
        }
        createTree(tree[0]);
    }
}

function updateUserstring(newUserString) {
    userString = newUserString;
    let [b,tree] = parseExpr(userString.split(" ").filter(e => e));
    if (b) {
        document.getElementById("userString").innerHTML = "Parsing <b class='error'>invalid</b> string: " + userString;
    }
    else {
        document.getElementById("userString").innerHTML = "Parsing string: " + userString;
    }
    //document.getElementById("userString").innerHTML = userString;
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
    if (tokens === []) return [true,[{name: "", concatName: "", invalid: true},[]]] // Error??

    switch (tokens[0]) {
        case "*":
            let resM = parseExpr(tokens.slice(1))
            
            let resM2 = parseExpr(resM[1][1])
                return [resM[0]||resM2[0],[{
                    name: "*",
                    concatName: "*",
                    children: [
                        resM[1][0],
                        resM2[1][0]
                    ]}, resM2[1][1]]]
            break;
        case "+":
            let resA = parseExpr(tokens.slice(1))
            
            let resA2 = parseExpr(resA[1][1])
                return [resA[0]||resA2[0],[{
                    name: "+",
                    concatName: "+",
                    children: [
                        resA[1][0],
                        resA2[1][0]
                    ]}, resA2[1][1]]]
            break;
        case "-":
            let resS = parseExpr(tokens.slice(1))
            
            let resS2 = parseExpr(resS[1][1])
                return [resS[0]||resS2[0],[{
                    name: "-",
                    concatName: "-",
                    children: [
                        resS[1][0],
                        resS2[1][0]
                    ]}, resS2[1][1]]]
            //}
            break;
        default:
            if (isNumeric(tokens[0])) {
                return [false,[{
                    name: String(tokens[0]),
                    concatName: String(tokens[0])
                }, tokens.slice(1)]]
            }
            else {
                return [true,[{name: "", concatName: "", invalid: true}, tokens.slice(1)]]
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