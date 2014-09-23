var jsdom = require('jsdom');
var startWeek;
var startDate;
var allCourses = [];
var allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

module.exports = {
  update: function () {
    updateTimetable();
  },
  getCourses: function (_class) {
  	var now = new Date().getTime();
    var results = [];
    var courses = allCourses[_class];

    // Some ugly preprocessing
    var t50Min = 50 * 60 * 1000;
    var t9Hour = 9 * 60 * 60 * 1000;
    var t36Hour = 36 * 60 * 60 * 1000;
    var hasNext = false, hasTomorrow = false, hasFuture = false;

    for (var i in courses) {
      var dif = courses[i].timestamp - now;
      if (dif < -t50Min)
        continue;
      if (dif >= -t50Min && dif < 0)
        courses[i].cap = 'Now';
      else if(!hasNext && dif < t9Hour)
        courses[i].cap = 'Next', hasNext = true;
      else if(!hasTomorrow && dif > t9Hour && dif < t36Hour)
        courses[i].cap = 'Tomorrow', hasTomorrow = true;
      else if (!hasFuture)
      	courses[i].cap = 'On ' + allDays[courses[i].day], hasFuture = true;

      if (dif > t36Hour && results.length > 4)
        break;
      results.push(courses[i]);
    }

    return results;
  }
};

function parseStartDate(str) {
	str2 = str.match(new RegExp('Week [0-9]+ start date:'), 'g')[0];
	startWeek = str2.match(new RegExp('[0-9]'), 'g')[0];
	str2 = str.match(new RegExp('start date: Monday [^<>]+'), 'g')[0];
	startDate = new Date(str2.substring(12));
	return true;
}

function parseExtra(str) {
	//console.log('#parseExtra', str);

	var type = str.match(new RegExp('[A-Z][A-Z][A-Z]', 'g'));
	if (!type) type = '?'; else type = type[0]; 
	var lecturers = str.match(new RegExp('[a-z]\.?[a-z]+[0-9]*'), 'g');
	if (!lecturers) lecturers = [''];
	var weeks = str.match(new RegExp('([0-9]+-[0-9]+)'), 'g');
	var room = str.match(new RegExp('[0-9][0-9][0-9]'), 'g');
	if (!room) room = '0'; else room = room[0];
	if (weeks != null && weeks.length > 0) {
		var start = weeks[0].split('-')[0];
		var end = weeks[0].split('-')[1];
	}
	lecturers = lecturers.join(',');

	return [type, lecturers, start, end, room];
}

function weekToDate(week, day, cnt, min) {
	//console.log('#time', week, startWeek, week - startWeek);
	var hour = 9 + Math.floor(cnt / 6);
	return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() 
		+ 7 * (week - startWeek) + day, hour, min);
}

function cntToHour(cnt) {
	cnt = Math.floor(cnt / 6);
	hour = (cnt == 0 ? '09' : 9 + cnt);
	return [hour + ':00', hour + ':50'];
} 

function parseTdata(courses, html, cnt, day) {
	html = html.replace(new RegExp('<br>', 'g'), '\n');
	html = html.replace(new RegExp('<[a-z]+.[^>]+>', 'g'), '');
	html = html.replace(new RegExp('</[a-z]+.[^>]+>', 'g'), '');
	
	//console.log('#parseTdata', html, cnt, day);

	var lastCourse = "";
	//var hour = startDate
	var items = html.split('\n');
	for (var i = 0; i < items.length; ++i) {
		if (items[i].length <= 1)
			continue;
		if (lastCourse === items[i]) {
			++i;
			continue;
		}

		var name = items[i];
		++i;
		while (i < items.length && items[i].length <= 1) {
			++i;
		}
		if (i == items.length) {
			break;
		}
		var extras = parseExtra(items[i]);

		for (var week = parseInt(extras[2]); week <= parseInt(extras[3]); ++week) {
			var stdate = weekToDate(week, day, cnt, 0);
			if (stdate.getTime() + 3060000 < new Date().getTime())
				continue;

			var course = {};
			course.name = name;
			course.startDate = stdate;
			course.timestamp = parseInt(stdate.getTime());
			course.day = day
			course.endDate = weekToDate(week, day, cnt, 50);
			course.start = cntToHour(cnt)[0];
			course.end = cntToHour(cnt)[1];
			course.type = extras[0];
			course.lec = extras[1];
			course.room = extras[4];
			courses.push(course);
		}

		lastCourse = name;
	}	
}

function parseTimetable(url, courses) {
	// Parse the html timetable for a specific class
	jsdom.env(url,
    	["http://code.jquery.com/jquery.js"],
    	function (errors, html) {
	    	try {
	    		var $ = html.$;
		    	var res = parseStartDate($('body').html());

		    	var cnt = 0;
		    	var day = -2;
		    	$('td').each(function() {
		    		day = (day == 4 ? -1 : day + 1);
		    		// This way we skip the first column
		    		if (day >= 0)
		    			parseTdata(courses, $(this).html(), cnt, day);
		    		++cnt;
		    	});
		    	
		    	courses.sort(function(a, b) {
					return parseInt(a.timestamp) - parseInt(b.timestamp);
				});
			} catch(err) {
				console.log("Failed to parse", url, " got:", err)
			}
		}	
	);
}

function updateTimetable() {
	allCourses = [];
	//return;

	for (_class in classes) {
		allCourses[_class] = [];
		parseTimetable(urls[_class], allCourses[_class]);
	}
	setTimeout(updateTimetable, 14400000);
}

var classes = [];
classes[1] = "Computing 1";
classes[2] = "Computing 2";
classes[3] = "Computing 3";
classes[4] = "Computing 4";
classes[5] = "Electronic and Information Engineering 1";
classes[6] = "Electronic and Information Engineering 2";
classes[7] = "Electronic and Information Engineering 3";
classes[8] = "Electronic and Information Engineering 4";
classes[18] = "Electronic Engineering 3";
classes[15] = "Electronic Engineering 4";
classes[9] = "Joint Mathematics and Computer Science 1";
classes[10] = "Joint Mathematics and Computer Science 2";
classes[11] = "Joint Mathematics and Computer Science 3";
classes[12] = "Joint Mathematics and Computer Science 4";
classes[17] = "MCI";
classes[28] = "MRes in Advanced Computing";
classes[14] = "MSc Advanced Computing";
classes[19] = "MSc Computing";
classes[13] = "MSc Computing Science";

var urls = [];
urls[0] = 'http://www.doc.ic.ac.uk/internal/timetables/2014-15/autumn/class/';
for (id in classes)
	urls[id] = urls[0] + id + '_1_1.htm';
