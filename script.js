//
// Variables used in the web page
//

colors = ['red', 'yellow', 'green', 'blue', ];

length = 4;

banner = document.getElementById('banner');
secretDiv = document.getElementById('secret');
historyDiv = document.getElementById('history');
guessDiv = document.getElementById('guess');
dotsDiv = document.getElementById('dots');
menuDiv = document.getElementById('menu');

//
// Functions used in the web page:
//

// Makes a dot
function makeDot(color=colors[0], htmlClass='dot') {
	let dot = document.createElement('span');
    	dot.style.backgroundColor = color;
	dot.className = htmlClass;
	return dot;
}

// Makes a button
function button(name, func) {
    	let result = document.createElement('button');
    	result.onclick = func;
    	result.appendChild(document.createTextNode(name));
    	return result
}

// Checks if two arrays match perfectly
function matches(a, b) {
	if (a.length !== b.length) {
		return false;
	}

	// After this loop, equals is true only if all elements of the array are equal
	let equals = true;
	for (let i=0; i < a.length; i++) {
		equals = equals && (a[i] == b[i]);
	}
	return equals;
}

// Returns a random code
function random() {
    	let result = [];
    	let choose = function(choices) { // Picks a random element from choices
    		return choices[Math.floor(Math.random() * choices.length)];
    	}
    	while (result.length < length) {
        	result.push(choose(colors));
    	}
    	return result;
}

// Clears the current guess
function clear() {
	for (let i=0; i<guessDiv.children.length; i++) {
		guessDiv.children[i].style.backgroundColor = 'white';
	    	guessDiv.children[i].className = 'empty';
	}
}

// Pulls the current guess from the page as an array
function guess() {
    	let result = [];
    	for (let i=0; i<guessDiv.children.length; i++) {
	        let color = guessDiv.children[i].style.backgroundColor;
        	if (color != 'white') {
            	result.push(color);
        	}
    	}
    	return result;
}

// Adds the color to the guess
function addColor(color) {
	// The first 'empty' dot is colored
	for (let i=0; i<guessDiv.children.length; i++) {
	    	if (guessDiv.children[i].className == 'empty') {
	        	guessDiv.children[i].style.backgroundColor = color;
	        	guessDiv.children[i].className = 'dot';
	        	break; // No 'empty' dot? Then nothing happens in this loop
	    	}
	}
}

// Creates an array of all possible codes
function allCodes(base=[[]]) {
	let longer = [];
	for (let i=0; i < base.length; i++) { // For each base array
		for (let j=0; j < colors.length; j++) { // Add another array with the next color at the end
			longer.push(base[i].concat([colors[j]]));
		}
	}

	// If the arrays need to be longer, continue recursion
	return longer[0].length < length ? allCodes(longer) : longer
}

// Creates an array of all possible responses    
function allResponses() {
	let responses = [];
	for (let i=0; i <= length; i++) {
		for (let j=0; i + j <= length; j++) {
			responses.push([i, j]);
		}
	}
	return responses;
}

// Gives a response to a guess only when the code is complete
function respond(code, hidden) {
	let full_matches = 0;
	let half_matches = 0;

	// Anything that is not a full-match is saved to review for half-matches
	let unmatched_code = [];
	let unmatched_hidden = [];
	for (let i=0; i < hidden.length; i++) {
		if (hidden[i] == code[i]) {
			full_matches++;
		} else {
			unmatched_code.push(code[i]);
			unmatched_hidden.push(hidden[i]);
		}
	}

	// Half matches are found where a color matches but location doesn't
	for (let i=0; i < unmatched_hidden.length; i++) {
		if (unmatched_code.includes(unmatched_hidden[i])) {
			half_matches++;
			// The half-matched dot is removed because a color match has been found
			unmatched_code.splice(unmatched_code.indexOf(unmatched_hidden[i]), 1);
		}
	}

	return [full_matches, half_matches];
}

// Gives all codes eliminated by a response
function eliminate(guess, response) {
	let eliminated = [];

	// Find all codes that are eliminated by the guess/response combination
	for (let i=0; i < remainingCodes.length; i++) {
		if (!matches(response, respond(guess, remainingCodes[i]))) {
			eliminated.push(remainingCodes[i]);
		}
	}

	return eliminated;
}

// Submit a guess for a response
function submit(code) {
	// The proper response, and the potential answers eliminated
	let response = respond(code, secret);
	let eliminated = eliminate(code, response);

    // The eliminated codes are removed from remainingCodes
	let remaining = [];
	for (let i=0; i < remainingCodes.length; i++) {
		if (!eliminated.includes(remainingCodes[i])) {
			remaining.push(remainingCodes[i]);
		}
	}
	remainingCodes = remaining;

	// Elements for the response are created        
    	let div = document.createElement('div');
    	let dotResponse = document.createElement('div');
    	let textResponse = document.createElement('div');

    	// Colored dots are copied for the response
    	for (let i=0; i<code.length; i++) {
        	dotResponse.appendChild(makeDot(code[i]));
    	}

	// The text response is created
	textResponse.setAttribute("class", "response");
	textResponse.innerHTML += "<strong>" + response[0] + "</strong> right color/place | ";
	textResponse.innerHTML += "<strong>" + response[1] + "</strong> right color, wrong place ";
	div.appendChild(textResponse);
	
    	// The elements are added to the page and the guess is cleared
    	div.appendChild(dotResponse);
    	div.appendChild(textResponse);
    	historyDiv.appendChild(div);
    	clear();

    	// If the game has been solved, celebrate victory!
	if (matches(code, secret)) {
		// Remove all dots from the secretDiv
        	while (secretDiv.firstChild) {secretDiv.removeChild(secretDiv.firstChild);}

		for (let i=0; i < code.length; i++) {
			secretDiv.appendChild(makeDot(secret[i]));
		}

		// Then the question "Can you break the code?" is changed to "You win!"
		banner.innerText = "You win!";
	}
}

// Game artificial intelligence
function ai() { 
	// The first remaining code will win or at least eliminate itself
	let guess = remainingCodes[0];
	let best = 1;

	for (let i=0; i < allCodes().length; i++) { // Each potential code is checked
		let eliminated= [];

		for (let j=0; j < allResponses().length; j++) { // against each potential response
			eliminated.push(eliminate(allCodes()[i], allResponses()[j]).length);
		}
		
		if (Math.min(...eliminated) > best) { // and the code with the best minimum is found
			guess = allCodes()[i];
			best = Math.min(...eliminated);
		}
	}

	// The code with the best minimum eliminations is submitted
	submit(guess);
}

// The game is reset
function reset() {
    	secret = random();
    	remainingCodes = allCodes();

    	// History is cleared
    	while (historyDiv.firstChild) {historyDiv.removeChild(historyDiv.firstChild);}

    	// Secret is cleared
    	while (secretDiv.firstChild) {secretDiv.removeChild(secretDiv.firstChild);}

    	// The banner is reset
	banner.innerText = "Can you break the code?";

    	// Gray question mark dots are put in place of the secret code
	for (let i=0; i < secret.length; i++) {
		let dot = makeDot("gray", "dots");
		dot.appendChild(document.createTextNode("?"));
		secretDiv.appendChild(dot);
	}
}

//
// The website is built
//

// Make the dots that change color
for (let i=0; i<length; i++) {
	guessDiv.appendChild(makeDot('white', 'empty'));
}

// Add a clickable dot for each color
for (let i=0; i < colors.length; i++) {
	let dot = makeDot(colors[i]);
	dot.onclick = function () {addColor(colors[i]);};
	dotsDiv.appendChild(dot);
}

// Add buttons to the page
menu.appendChild(button('Submit', function () {
    	if (guess().length == length) {
	        submit(guess());
    	}
}));
menu.appendChild(button('Clear', clear));
menu.appendChild(button('AI', ai));
menu.appendChild(button('New Game', reset));

reset();
