//temp data
localStorage.setItem("2017-01-24S2017-02-07E",JSON.stringify([{
  title: "일정",
  start: "2017-01-24T00:00:00Z",
  end: "2017-02-07T01:59:00Z",
  allDay: "false",
  repeat: "none",
  place: "where",
  desc: "dddddd"
}]));
localStorage.setItem("2016-12-06S2016-12-08E", JSON.stringify([{
    title: "일정",
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
    this.getThisMonthEvent()
    this.status = {
        isStart: true,
        isEnd: true,
        length: 0,
        diff: 0,
        hasNewLine: false
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
      var start = new Date(this.schedule.start);
      var startDate = Utility.formDate(start.getFullYear(), start.getMonth()+1, start.getDate());

      this.initStatus();
      var weeks = document.querySelectorAll(".fc-month-view .fc-day-grid .fc-row.fc-week");
      var dateHead = null;
      var dateBody = null;
      for (var i = 0; i < weeks.length; i++) {
        if(!this.status.hasNewLine) {
          if (this.status.isStart) {
            dateHead = weeks[i]._$(".fc-content-skeleton [data-date=\"" + startDate + "\"]");
          } else {
            dateHead = weeks[i]._$(".fc-content-skeleton thead tr").firstElementChild;
          }
          if(this.status.diff !== 0) {
            var rowHead = weeks[i]._$(".fc-content-skeleton thead");
            dateBody = Utility.getTbodyFromThead(rowHead, dateHead);
          }
        } else {
          dataHead = weeks[i]._$(".fc-content-skeleton thead tr").firstElementChild;
          dateBody = weeks[i]._$(".fc-content-skeleton tbody tr").firstElementChild;
        }
        if (dateHead !== null && dateBody !== null) {
          var remain = this.status.diff - Utility.getElementPosition(dateBody) - 1;

          this.setBarStatus(remain,this.status);

          Utility.addClass(dateBody, "fc-event-container");
          if (this.status.length !== 1) {
            dateBody.setAttribute("colspan", this.status.length);

            for(var j = 0; j < this.status.length-1; j++) {
              var week = weeks[i].querySelectorAll(".fc-content-skeleton tbody tr");
              week[eventRow].removeChild(week[eventRow].lastElementChild);
            }
          }

          this.setEventBar(dateBody, event.title);
          if (this.status.isEnd === true) {
            break;
          }
        }
      }
    },

    setBarStatus: function(remain, status) {
      status.isEnd = true;
      if(status.hasNewLine === true) {
        status.isStart = false;
      }
      if(remain > 0) {
        status.hasNewLine = true;
        status.isEnd = false;
      }

      if(status.isEnd) {
        status.length = status.diff;
      } else if (status.isStart) {
        status.length = status.diff - remain;
      } else if(!status.isStart && !status.isEnd) {
        status.length = 7;
      }

      status.diff -= status.length;

      if(status.diff === 0) {
        status.isEnd = true;
        status.hasNewLine = false;
      }
    },



  setEventBar: function(ele, title) {
    ele.innerHTML = "<a class = \"fc-day-grid-event fc-h-event fc-event fc-draggable fc-resizable\">"
        + "<div class = \"fc-content\">"
        + "<span class=\"fc-title\">" + title + "</span></div></a>";

    var eventLink = ele._$("a");

    if(this.status.isStart) {
      Utility.addClass(eventLink,"fc-start");
    }
    else {
      Utility.addClass(eventLink,"fc-not-start");
    }
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

  initStatus: function() {
    var start = new Date(this.schedule.start);
    var end = new Date(this.schedule.end);
    var firstDate = Date.parse(this.calendar.firstDay);

    if (start < firstDate) {
      this.status.diff = Math.ceil((end - firstDate) / (1000 * 60 * 60 * 24));
      this.status.isStart = false;
    } else {
      this.status.diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      this.status.isStart = true;
    }
    this.status.isEnd = true;
    this.status.length = 0;
    this.status.hasNewLine = false;
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
    var first = new Date(this.calendar.firstDay);
    var last = new Date(this.calendar.lastDay);
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
