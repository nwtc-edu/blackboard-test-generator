
document.observe("dom:loaded", documentHandler);

// define "constants" as references to various question type abbreviations
var multipleChoice = "MC";
var multipleAnswer = "MA";
var trueFalse = "TF";
var essay = "ESS";
var ordered = "ORD";
var matching = "MAT";
var fillInBlank = "FIB";
var noMatch = ">>> Unable To Determine Question Type <<<";
var generateLabel = "Generate &#x2192;";
var downloadLabel = "Download &#x2193;";
var currentState = "generate";
var generateState = "generate";
var downloadState = "download";

// hold an array of all questions
var questions;

// build a properly formatted question set as defined by Blackboard here:  http://blackboardsupport.calpoly.edu/content/faculty/tips_upload.html
var result = "";

// foundation template string that is shared by every question
// each question type has different answers, etc. so each question
// will build a custom template string, beginning with baseTemplateStr
var baseTemplateStr = '#{type}	#{question}';

var defaultInputStr = "Type your questions in Word. (Click the Help button for an example for required formatting.) Copy and paste your test here.";

var generateHelp;
var downloadHelp;

function help()
{
	var viewport = { width: document.viewport.getWidth(), height: document.viewport.getHeight() };
	var lightboxDimensions = { width: $($('lightbox')).getWidth(), height: $($('lightbox')).getHeight() };
	
	$($('lightbox')).setStyle({ left: (viewport.width / 2 - lightboxDimensions.width / 2) + "px",
															top: "90px" });
	$($('mask')).setStyle({ width: viewport.width + "px", height: viewport.height + "px" });
	$($('lightbox')).show();
	$($('mask')).appear({ duration: 0.3, to: 0.2 });
}

function hideHelp()
{
	$($('lightbox')).hide();
	$($('mask')).fade({ duration: 0.3 });
}

function documentHandler()
{
	setState(generateState);
	
	if ($($('inputTxt')).value == defaultInputStr) { $($('inputTxt')).addClassName('instructions'); }
	
	$($('outputTxt')).hide();
	
	$($('debug')).hide();
	
	$($('generatorBtn')).update(generateLabel);
	
	generateHelp = $($('generate_help')).clone(true);
	downloadHelp = $($('download_help')).clone(true);
	
	$($('generate_help')).remove();
	$($('download_help')).remove();
	
	$($('help')).update(generateHelp);

	Event.observe("generatorBtn", "click", generatorBtnHandler);
	Event.observe("inputTxt", "change", inputTxtHandler);
	Event.observe("inputTxt", "focus", inputTxtHandler);
	Event.observe("inputTxt", "blur", inputTxtHandler);
}

function debug(info)
{
	if (!$($('debug')).visible()) { $($('debug')).show(); }
	$($('debug')).value += info + "\n\n";
}

function generatorBtnHandler(evt)
{
	var txt = $($('inputTxt')).value;
	var output;
	
	switch (currentState) {
		case generateState:
			output = generateTest(txt).gsub(/\n$/, "\r\n");
			$($('outputTxt')).show();
			$($('outputTxt')).value = output;
			setState(downloadState);
			break;
			
		case downloadState:
			$($('testForm')).submit();
			// new Ajax.Request('generate.php',
			// 									{ onCreate: function() { },
			// 									 	onFailure: function() { alert("failed...") },
			// 									 	onSuccess: function(response) { alert("responseText(): " + response.responseText); },
			// 									 	onComplete: function() { } });
			break;
	}
}

function inputTxtHandler(evt)
{
	var txt = $($('inputTxt')).value;
	
	switch (evt.type) {
		case "change":
			break;
			
		case "focus":
			setState(generateState);
			if (txt == defaultInputStr) {
				$($('inputTxt')).update("");
				$($('inputTxt')).removeClassName('instructions');
			}
			break;
			
		case "blur":
			if (txt.blank()) {
				$($('inputTxt')).update(defaultInputStr);
				$($('inputTxt')).addClassName('instructions');
			}
			break;
	}	
}

function setState(state)
{
	var pos = { x: 0, y: 0 };
	
	if (currentState != state) {
		switch (state) {
			case generateState:
				$($('closeBtn')).removeClassName("orange");
				$($('closeBtn')).addClassName("blue");
				
				$($('video_1')).removeClassName("orange");
				$($('video_1')).addClassName("blue");
				
				$($('video_2')).removeClassName("orange");
				$($('video_2')).addClassName("blue");
				
				$($('lightbox')).setStyle({ backgroundImage: "url('images/lightboxBlue.png')" });
				$($('help')).update(generateHelp);

				$($('generatorBtn')).update(generateLabel);
				pos.x = $($('inputTxt')).cumulativeOffset()[0] - $($('generatorBtn')).cumulativeOffset()[0];

				morphColors("generatorBtn", "backgroundColor", "#2daebf");
				morphColors("helpBtn", "backgroundColor", "#2daebf");
				morphColors("video_1", "backgroundColor", "#2daebf");
				morphColors("video_2", "backgroundColor", "#2daebf");
				morphColors("main", "borderTopColor", "#2daebf");
				break;
			
			case downloadState:
				$($('closeBtn')).removeClassName("blue");
				$($('closeBtn')).addClassName("orange");
				
				$($('video_1')).removeClassName("blue");
				$($('video_1')).addClassName("orange");

				$($('video_2')).removeClassName("blue");
				$($('video_2')).addClassName("orange");

				$($('lightbox')).setStyle({ backgroundImage: "url('images/lightboxOrange.png')" });
				$($('help')).update(downloadHelp);

				$($('generatorBtn')).update(downloadLabel);
				pos.x = $($('outputTxt')).cumulativeOffset()[0] - $($('generatorBtn')).cumulativeOffset()[0];

				morphColors("generatorBtn", "background", "#ff5c00");
				morphColors("helpBtn", "background", "#ff5c00");
				morphColors("video_1", "background", "#ff5c00");
				morphColors("video_2", "background", "#ff5c00");
				morphColors("main", "borderTopColor", "#ff5c00");
				break;
		}
		
		new Effect.Move("generatorBtn", pos);
		
		currentState = state;
	}
}

function morphColors(element, style, color)
{
	var options = new Hash();
	
	options.set(style, color);
	
	new Effect.Morph(element, { style: options });
}

// called from form
// accepts one string value from a textarea, for example
function generateTest(txt)
{
	// See http://www.evolt.org/regexp_in_javascript for explanation
	
	// Flags:
	// 		i: ignore case
	// 		g: the global search flag makes the RegExp search for a pattern
	// 				throughout the string, creating an array of all occurrences it can find matching the given pattern.
	// 		m: this flag makes the beginning of input (^) and end of input ($) codes also catch beginning and end of line respectively.
	
	// 		\d matches any digit
	// 		\s matches any whitespace
	// 		+ is short for {1,} - which means one or more
	// 		\n matches linefeed
	var splitRegex = /^\s*\d+.\s*/im;
	
	// reset result to an empty string
	result = "";
	
	// remove any comment lines from the entire string
	txt = txt.gsub(/^\s*\W.*\n/i, "");
	
	// break txt into an array
	// $A is a prototype shortcut for initializing a prototype Array
	questions = $A(txt.split(splitRegex));
	
	// remove any entries in questions that are nothing
	questions = questions.grep(/.+/);

	// enumberable.each will call interpolateQuestion for each element in questions
	// interploateQuestion needs to accept 1 argument which is the array element
	questions.each(interpolateQuestion);
	
	return result;

	// return result.escapeHTML();
}

// called from generateTest - questions.each(interpolateQuestion);
function interpolateQuestion(item)
{
	// hold the rows within item
	var rows;
	
	// create a hash from each row in rows that will be used by Template.evaluate
	var rowObject = new Hash();
	
	// initialize the string to give to new Template with our baseTemplateStr
	var templateStr = baseTemplateStr;
	
	// create a new template once the templateStr has been constructed
	var template;
	
	// cache the individual answer for a multipleChoice type question so the string can be modified
	var newValue = "";
	
	var question = ">>> Please specify a question <<<";
	
	// break item into separate lines based on single line breaks
	rows = item.split(/\n|\f|\r|\r\n/);
	
	// previous call to "item.split" is creating an array with 1 too many rows so I cheat and eliminate those rows
	rows = rows.grep(/.+/);
	
	rows.invoke("strip");
	
	// create a new row in rowObject with "question" as the key and rows[0] as the value
	if (!rows[0].blank()) {
		question = rows.shift();
		question = question.gsub(/^\d+\.\s+/, "");
		question = question.gsub(/$\n|\f|\r|\r\n/, "");
	}
	rowObject.set("question", question);
	
	// create a new row in rowObject with "type" as the key and determine the correct type
	// if there are no optional answers provided, assume the question is an essay
	// otherwise, loop through those optional answers and attempt to determine the proper question type
	rows.length < 1 ? rowObject.set("type", essay) : rowObject.set("type", getQuestionType(rows));
	
	// loop through the remaining rows in rows to build a complete template string
	// that will accommodate each answer
	// also modify each answer so a., b.'s and c.'s are removed from questions
	// which are NOT of type multipleChoice and multipleAnswer
	for (var i = 0; i < rows.length; i++) {
		// build on templateStr
		templateStr += "\t#{" + i.toString() + "}";

		// if the question is a multipleChoice or multipleAnswer, then replace each * with Correct
		// otherwise, insert an Incorrect if there is no *
		// if the question is a different type, then simply remove any a.'s, b.'s or c.'s from the beginning of the string
		// \w will match word characters (a-z, A-Z, 0-9 and underscore)
		// \s will match whitespace
		// + match one or more
		// \d find a digit
		rows[i] = rows[i].strip(); // remove all leading and trailing whitespace
		if (rowObject.get("type") == multipleChoice || rowObject.get("type") == multipleAnswer) {
			rows[i] = rows[i].sub(/\t/, " "); // remove all tab characters
			if (rows[i].endsWith("*")) {
				rows[i] = rows[i].sub(/\*$/, "\tCorrect");
			} else {
				rows[i] = rows[i] + "\tIncorrect";
			}
		} else {
			rows[i] = rows[i].sub(/^\w\W\s*/, "");
		}
		
		// if the question is of type ordered, then remove the ending digit (this digit is only to differentiate from matching questions)
		if (rowObject.get("type") == ordered) {
			rows[i] = rows[i].sub(/\s\d$/, "");
		}
		
		// create a new element in rowObject which will be interpolated into our template, using templateStr
		rowObject.set(i.toString(), rows[i]);		
	}
	
	// create our template
	template = new Template(templateStr);

	// add to our result variable with the return value of Template.evaluate
	result += template.evaluate(rowObject) + "\n";
}

function getQuestionType(arr)
{
	var matches = [];
	
	arr = arr.collect(function(r) { return r.toLowerCase().strip(); });
	
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].endsWith("*")) {
			matches.push("*");
		} else if (arr[i].include("true") || arr[i].include("false")) {
			matches.push("tf");
		} else if (arr[i].include("\t")) {
			if (arr[i].strip().endsWith(String(i + 1))) {
				matches.push("ordered");
			} else {
				matches.push("matching");
			}
		} else {
			matches.push(null);
		}
	}
	
	// need to account for multipleChoice, multipleAnswer, trueFalse, essay, matching, ordered
	
	if (matches.grep("*").length == 1) {
		return multipleChoice;
	} else if (matches.grep("*").length > 1) {
		return multipleAnswer;
	} else if (matches.include("tf")) {
		return trueFalse;
	} else if (matches.include("matching")) {
		return matching;
	} else if (matches.include("ordered")) {
		return ordered;
	} else {
		return noMatch;
	}
	
}

