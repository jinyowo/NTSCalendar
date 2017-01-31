//temp data
localStorage.setItem("2017-01-24S2017-02-07E",JSON.stringify([{
  title: "1/24~2/7",
  start: "2017-01-24T00:00:00Z",
  end: "2017-02-07T01:59:00Z",
  allDay: "false",
  repeat: "none",
  place: "where",
  desc: "dddddd"
}]));
localStorage.setItem("2016-12-06S2016-12-08E", JSON.stringify([{
    title: "12/6~/12/8반",
    start: "2016-12-06T00:00:00Z",
    end: "2016-12-08T02:59:00Z",
    allDay: "false",
    repeat: "W",
    place: "where",
    desc: "dddddd"
}]));

function ScheduleDisplay() {
    this.scheduleObjects;
    this.schedule;
    this.remainedSchedules;
    this.status;
}

ScheduleDisplay.prototype = {
  init: function(calendar, due, type) {
    //TODO:due와 type 이용해 일정 기간 스케쥴들 가져오는 함수 추가해야함
    // TODO: data.js에 저장해 둔 일정을 불러오는 형식으로 변경할 것.
    this.scheduleObjects = [];
    this.calendarType = type;
    this.calendar = calendar;
    this.getThisMonthEvent();
    this.status = {
        isStart: true,
        isEnd: true,
        remain: 0
    };
  },

  setEvents: function() {
    for(var i = 0; i < this.scheduleObjects.length; i++) {
      var schedules = JSON.parse(this.scheduleObjects[i])
      for (var j = 0; j < schedules.length; j++) {
        this.schedule = schedules[j];
        if (this.schedule.repeat !== "none") this.repeatEvent(this.schedule);
        this.setMonthEvent(this.schedule, 0);
      }
    }
    //TODO: 후에 여러개 등록 시 반복문 사용하여 모든 스케쥴 표시
  },

  setMonthEvent: function(event, eventRow) {
      var start = Utility.setTimeByGMT(new Date(this.schedule.start));
      var startDate = Utility.formDate(start.getFullYear(), start.getMonth()+1, start.getDate());

      this.initStatus();
      var weeks = document.querySelectorAll(".fc-month-view .fc-day-grid .fc-row.fc-week");
      var dateHead = null;
      var dateBody = null;
      for (var i = 0; i < weeks.length; i++) {
        if (this.status.isStart) {
          dateHead = weeks[i]._$(".fc-content-skeleton [data-date=\"" + startDate + "\"]");
        } else {
          dateHead = weeks[i]._$(".fc-content-skeleton thead tr").firstElementChild;
        }
        var rowHead = weeks[i]._$(".fc-content-skeleton thead");
        dateBody = Utility.getTbodyFromThead(rowHead, dateHead);


        if (dateHead !== null && dateBody !== null) {
          for (var day = 0; day < 7 && dateBody !== null && this.status.isEnd !== true; day++) {
            this.setEventBar(dateBody, event.title);
            dateBody = dateBody.nextElementSibling;
          }
        }
          if (this.status.isEnd === true) {
            break;
          }
      }
  },

    initStatus: function() {
      var start = Utility.setTimeByGMT(new Date(this.schedule.start));
      var end = Utility.setTimeByGMT(new Date(this.schedule.end));
      var firstDate = Utility.setTimeByGMT(new Date(this.calendar.firstDay));

      if (start < firstDate) {
        this.status.remain = Math.ceil((end - firstDate) / (1000 * 60 * 60 * 24));
        this.status.isStart = false;
      } else {
        this.status.remain = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        this.status.isStart = true;
      }
      this.status.isEnd = false;
    },

    setBarStatus: function(status) {

      if(status.isStart) {
        status.isStart = false;
      }

      status.remain --;

      if(status.remain === 0) {
        status.isEnd = true;
      }
    },

  setEventBar: function(ele, title) {
    Utility.addClass(ele, "fc-event-container");
    ele.innerHTML = "<a class = \"fc-day-grid-event fc-h-event fc-event fc-draggable fc-resizable\">"
        + "<div class = \"fc-content\">"
        +"</div></a>";
    var eventLink = ele._$("a");

    if (ele.isEqualNode(ele.parentNode.firstElementChild) || this.status.isStart) {
      eventLink._$("div").innerHTML = "<span class = \"fc-title\">" + title + "</span>";
    }
    if(this.status.isStart) {
      Utility.addClass(eventLink,"fc-start");
    }
    else {
      Utility.addClass(eventLink,"fc-not-start");
    }
    this.setBarStatus(this.status);
    if(this.status.isEnd) {
      Utility.addClass(eventLink,"fc-end");
    }
    else {
      Utility.addClass(eventLink,"fc-not-end");
    }
  },

  getThisMonthEvent: function() {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i)
      var due = key.split("S");
      var eStart = due[0];
      var eEnd = due[1].replace("E","");


      if (eEnd < this.calendar.lastDay) {
        // 지난달과 이번달에 해당하는 repeatEvent를 받아온다
        if(this.isRepeatEvent(key)) continue;

        if (eEnd > this.calendar.firstDay) {
          this.scheduleObjects.push(localStorage.getItem(key));
        }
      } else if (eStart > this.calendar.firstDay) {
        if (eStart < this.calendar.lastDay) {
          this.scheduleObjects.push(localStorage.getItem(key));
        }
      } else {
        this.scheduleObjects.push(localStorage.getItem(key));
      }
    }
  },
  isRepeatEvent: function(key) {
      var schedules = JSON.parse(localStorage.getItem(key));
      for (var i = 0; i < schedules.length; i++) {
        var schedule = schedules[i];
        if (schedule.repeat !== "none") {
          this.scheduleObjects.push(localStorage.getItem(key));
          return true;
      }
      }
      return false;
  },
  repeatEvent: function(event) {
    var repeatCycle = 0;
    switch (event.repeat) {
        case "Y":
            repeatCycle = 365;
            break;
        case "M":
            repeatCycle = 30;
            break;
        case "W":
            repeatCycle = 7;
            break;
        case "D":
            repeatCycle = 1;
            break;
    }
    var nextStart = new Date(event.start);
    var nextEnd = new Date(event.end);
    var first = Utility.setTimeByGMT(new Date(this.calendar.firstDay));
    var last = Utility.setTimeByGMT(new Date(this.calendar.lastDay));
    first.setHours(0);
    first.setMinutes(0);
    first.setSeconds(0);
    last.setHours(23);
    last.setMinutes(59);
    last.setSeconds(59);
    if (repeatCycle < 10) {
        while (first >= nextStart) {
            nextStart.setDate(nextStart.getDate() + repeatCycle);
            nextEnd.setDate(nextEnd.getDate() + repeatCycle);
        }
        while (last >= nextEnd) {
            var repeatSchedule = event;
            repeatSchedule.start = nextStart;
            repeatSchedule.end = nextEnd;
            this.setMonthEvent(repeatSchedule, 0);

            nextStart.setDate(nextStart.getDate() + repeatCycle);
            nextEnd.setDate(nextEnd.getDate() + repeatCycle);
        }
    } else if (repeatCycle === 30) {
        while (first >= nextStart) {
            nextStart.setMonth(nextStart.getMonth() + 1);
            nextEnd.setMonth(nextEnd.getMonth() + 1);
        }
        while (last >= nextEnd) {
            var repeatSchedule = event;
            repeatSchedule.start = nextStart;
            repeatSchedule.end = nextEnd;
            this.setMonthEvent(repeatSchedule, 0);

            nextStart.setMonth(nextStart.getMonth() + 1);
            nextEnd.setMonth(nextEnd.getMonth() + 1);
        }
    } else {
        while (first >= nextStart) {
            nextStart.setFullYear(nextStart.getFullYear() + 1);
            nextEnd.setFullYear(nextEnd.getFullYear() + 1);
        }
        while (last >= nextEnd) {
            var repeatSchedule = event;
            repeatSchedule.start = nextStart;
            repeatSchedule.end = nextEnd;
            this.setMonthEvent(repeatSchedule, 0);

            nextStart.setFullYear(nextStart.getFullYear() + 1);
            nextEnd.setFullYear(nextEnd.getFullYear() + 1);
        }
    }
  },
}
