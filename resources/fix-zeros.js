module.exports = (numberString) => {
    const regex = /\.\d+$/g;
    const matchArray = numberString.match(regex);

    if(matchArray === null) {
        return numberString = numberString + '.00'
    } else if(matchArray.length === 1 && matchArray[0].length === 2) {
        return numberString = numberString + '0';
    }
}