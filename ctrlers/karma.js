// a simple karma adder
module.exports = function(voter) {
    var result = 1;
    if (voter.karma > 100 || voter.type === 'admin') {
        result = 10;
    } else if (voter.karma > 50) {
        result = 5;
    } else if (voter.karma > 10) {
        result = 2;
    }
    return result;  
}