var log_records = [];  // Array of log records returned to Flask

var reviewRemarks = {};

$(window).on("load", function(){

    $("#submitter").click(function () {
        logData("pageClosed", "pageClosed");

        var data = {
            'data': log_records
        }
        var myData = JSON.stringify(data);

        $("#hidden_log").val(myData);
    });
});


function initMergely(elementId, height, contextHeight, width, lineNumberLeft, contentLeft, lineNumberRight, contentRight, prefixLineCount, prefix, suffix) {
	$(elementId).mergely({
		width: width,
		height: height,
		wrap_lines: true,
		fadein: '',
		cmsettings: { readOnly: true, mode: "text/x-java", autoresize: false, lineWrapping: true, gutters: ["remarks", "CodeMirror-linenumbers"]},
		lhs: function(setValue) {
			setValue(contentLeft);
		},
		rhs: function(setValue) {
			setValue(contentRight);
		},
		loaded: function() {
			var el = $(elementId);
			el.mergely('cm', 'lhs').options.firstLineNumber = lineNumberLeft;
			el.mergely('cm', 'rhs').options.firstLineNumber = lineNumberRight;
			el.mergely('cm', 'lhs').on("gutterClick", handleGutterClick);
			el.mergely('cm', 'rhs').on("gutterClick", handleGutterClick);
			el.mergely('cm', 'lhs').hunkId = elementId.replace('#compare', '');
			el.mergely('cm', 'rhs').hunkId = elementId.replace('#compare', '');
			el.mergely('cm', 'lhs').hunkSide = 0;
			el.mergely('cm', 'rhs').hunkSide = 1;
			//store prefix/suffix settings only on the left side
			el.mergely('cm', 'lhs').ps_height = contextHeight;
			el.mergely('cm', 'lhs').ps_linecount = prefixLineCount;
			el.mergely('cm', 'lhs').ps_prefix = prefix;
			el.mergely('cm', 'lhs').ps_lhs = contentLeft;
			el.mergely('cm', 'lhs').ps_rhs = contentRight;
			el.mergely('cm', 'lhs').ps_suffix = suffix;
			el.mergely('cm', 'lhs').ps_prefixActive = false;
			// el.mergely('update', function() {ensureViewCorrectSized(elementId)});
		}
	});
}


function logData(action, data){
    // console.log(`${new Date().getTime()};${action};${data}\n`)
    log_records.push(`${new Date().getTime()};${action};${data}\n`);
}


// function makeMarker(msg) {
// 	var marker = document.createElement("div");
// 	marker.title = msg;
// 	marker.style.color = "#dd0000";
// 	marker.innerHTML = "■";
// 	marker.style.fontSize = "18px";
// 	return marker;
// }

function makeMarker(msg){
	var marker = document.createElement("div");
	var icon = marker.appendChild(document.createElement("span"));
	icon.innerHTML = "!!";
	icon.className = "lint-error-icon";
	var name = marker.appendChild(document.createElement("span"))
	name.innerHTML = "<b>You: </b>";
	marker.appendChild(document.createTextNode(msg));
	marker.className = "lint-error";
	return marker;
}

function handleGutterClick(instance, lineNumber, gutter, clickEvent){
	var info = instance.lineInfo(lineNumber);
    var prevMsg = "";
	var realLineNumber = lineNumber + instance.options.firstLineNumber;

	if (!reviewRemarks[instance.hunkId]) {
		reviewRemarks[instance.hunkId] = {};
	}

    if (realLineNumber in reviewRemarks[instance.hunkId]){
    	prevMsg = reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent
	}

    var msg = prompt("Please enter review remark", prevMsg);

    if (msg == null) {
    	return
    }

	// instance.addLineWidget(lineNumber, makeMarker(msg), {coverGutter: true, noHScroll: true});

    if (realLineNumber in reviewRemarks[instance.hunkId]) {
    	if (msg == "") {
	    	// DELETE COMMENT
            logData("deletedComment", `${instance.hunkId}${instance.hunkSide}-${realLineNumber}`);
			reviewRemarks[instance.hunkId][realLineNumber].clear()
			// instance.setGutterMarker(lineNumber, "remarks", null);
			delete reviewRemarks[instance.hunkId][realLineNumber];
    	} else {
    		// UPDATE COMMENT
            logData("updateComment",
                `${instance.hunkId}${instance.hunkSide}-${realLineNumber}-${msg}`)
    		// info.gutterMarkers.remarks.title = msg;
    		// reviewRemarks[instance.hunkId][realLineNumber] = msg;
			reviewRemarks[instance.hunkId][realLineNumber].node.lastChild.textContent = msg
			reviewRemarks[instance.hunkId][realLineNumber].changed()
    	}
    } else {
    	if (msg == "") {
    		// CANCEL COMMENT
			logData("cancelComment",
                `${instance.hunkId}${instance.hunkSide}-${realLineNumber}`)
		} else {
    		// ADD COMMENT
            logData("addComment",
                `${instance.hunkId}${instance.hunkSide}-${realLineNumber}-${msg}`)
			// instance.setGutterMarker(lineNumber, "remarks", makeMarker(msg));

    		var line_widget = instance.addLineWidget(lineNumber, makeMarker(msg), {coverGutter: true, noHScroll: true});
    		reviewRemarks[instance.hunkId][realLineNumber] = line_widget;
            // addComment(lineNumber, msg, instance.hunkId, instance.hunkSide)
		}
    }
}