module.exports = (number1, number2) => {
    const regex = /\.\d+$/g;
    let total = (parseFloat(number1) + parseFloat(number2)).toString();
    const matchArray = total.match(regex);

    if(matchArray === null) {
        return total = total + '.00'
    } else if(matchArray.length === 1 && matchArray[0].length === 2) {
        return total = total + '0';
    }
}