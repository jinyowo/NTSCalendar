// month이름, weekday이름, 각 달의 마지막 날짜를 저장한 배열
var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var weekdayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var weekdayClassArray = ["fc-sun", "fc-mon", "fc-tue", "fc-wed", "fc-thu", "fc-fri", "fc-sat"];

// 오늘 년, 월, 일 정보를 저장할 object
var _today = new Date();
var Today = {
    year : _today.getFullYear(),
    month : _today.getMonth(),
    date : _today.getDate(),
};
// 달력의 type 3가지를 저장할 object
var calendarType = {
    month : document.querySelector(".fc-month-view"),
    week : document.querySelector(".fc-basicWeek-view"),
    day : document.querySelector(".fc-agendaDay-view"),
};
var buttonType = {
    arrow : "arrow",
    type : "type",
    today : "today",
};

var Utility = {
    padZero: function(number, length) {
        var result = number + '';
        while (result.length < length) {
            result = '0' + result;
        }
        return result;
    },
    formDate: function(year, month, date) {
        month = (month === 0) ? 12 : month;
        month = (month > 12) ? month % 12 : month;
        return year + "-" + this.padZero(month, 2) + "-" + this.padZero(date, 2);
    },
    addClass: function(ele, name) {
        ele.classList.add(name);
    },
    removeClass: function(ele, name) {
        ele.classList.remove(name);
    },
    showElement: function(ele) {
        ele.style.display = "block";
    },
    hideElement: function(ele) {
        ele.style.display = "none";
    },
    getTbodyFromThead: function(headEle, tdEle) {
        var tds = headEle.querySelectorAll("td");

        for (var i = 0; i < tds.length; i++) {
            if (tds[i].isEqualNode(tdEle)) {
                break;
            }
        }
        if (i < tds.length) {
            return headEle.nextElementSibling.firstElementChild.children[i];
        } else {
            return null;
        }
    },
    getElementPosition: function(ele) {
        var i = 0;
        while (ele.nextElementSibling !== null) {
            i++;
            ele = ele.nextElementSibling;
        }
        return i;
    },

    resetEvent: function() {
        var eventRow = document.querySelectorAll(".fc-content-skeleton tbody");

        for (var i = 0; i < eventRow.length; i++) {
            eventRow[i].innerHTML = "<tr>" +
                "\n<td></td>" +
                "\n<td></td>" +
                "\n<td></td>" +
                "\n<td></td>" +
                "\n<td></td>" +
                "\n<td></td>" +
                "\n<td></td>" +
                "\n</tr>";
        }
    },
};