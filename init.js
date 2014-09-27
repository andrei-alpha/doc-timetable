var icons = {'LEC': 'lec3.png', 'TUT': 'tut.jpg', 'LAB': 'lab2.png', '?': 'info.png'};
var _class, deleted = 0, classId = 0, nextId = 0, nextClass = 0, defaultClass = 4;
var courses;

$(document).ready(function() {
	getClasses();
	changeClass(defaultClass);
});

$( document ).on( "pagecreate", "#demo-page", function() {
    $( document ).on( "swipeleft swiperight", "#demo-page", function( e ) {
        if ( $( ".ui-page-active" ).jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swipeleft" ) {
                //$( "#right-panel" ).panel("open");
            } else if ( e.type === "swiperight" ) {
                $( "#left-panel" ).panel("open");
            }
        }
    });
});

function changeClass(param) {
	_class = param;
  $('#cnh').html(classes[_class]);
	getCourses();
}

function getClasses() {
	for (id in classes) {
		var template = $('#classItem').html();
		var classItem = template.format(++classId, classes[id]);
		$('#classes').append(classItem);
		$('#class-' + classId).attr('onclick', 'changeClass(' + id + ')');
	}
}

function getCourses() {
	deleted = 0;
	nextId = 0;
	$('#courses').html('');
	$.get('/timetable?class=' + _class, function(json) {
		courses = $.parseJSON(json);
		for (id in courses) {
			addCourse(courses[id]);
		}
    	updateCourses();
	});
}

function getRemaining(timestamp) {
	var rem = timestamp - new Date().getTime();
	var progress = -1 * Math.round(rem / 30000);

	if (rem < -3000000)
		return {'when': 'ended'};
	if (rem < 0)
		return {'when': 'Running', 'progress': progress};
	if (rem < 3600000)
		return {'when': Math.round(rem / 60000)  + ' minutes'};
	return {'when': Math.round(rem / 3600000) + ' hours'};
}

function addCourse(course) {
  	if (course.cap)
    	$('#courses').append('<h2>' + course.cap + '</h2>');

	var template = $('#listItem').html();

	var img = icons[course.type];
	var when = getRemaining(course.timestamp).when;
	course.extra = '<b>' + course.room + ' ' + course.lec + '</b> '
	var listItem = template.format(nextId++, course.name, course.start + 
		'-' + course.end, course.extra + when, img);
	$('#courses').append(listItem);
  $('#course-item-' + (nextId - 1)).attr('onclick', '$( "#left-panel" ).panel("close")');
}

function updateCourses() {
  for (var id in courses) {
  	var rem = getRemaining(courses[id].timestamp);
  	var oldId = +id + +deleted;

  	if (rem.when === 'ended') {
  		// TO DO: remove this slow shit
  		getCourses();
  		return;

  		$('#course-item-' + id).remove();
  		courses.shift();
  		++deleted;
  		continue;
  	}

  	$('#list-extra-' + oldId).html(courses[id].extra + rem.when);
  	if (rem.when === 'Running') {
  		var pb = $('#progress-bar-' + oldId).progressbar();
  		pb.progressbar('value', rem.progress);
  	}
  }
  
  setTimeout(updateCourses, 2000);
}

//first, checks if it isn't implemented yet
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
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
