const { application } = require("express");

module.exports = function(){

    const today = new Date();

    return today.toLocaleDateString();
}
