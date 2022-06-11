var dialogueDiv = document.querySelector("#text-div");

function SpawnDialogue(text, style)
{
	if(style != undefined)
		dialogueDiv.innerHTML += '<p class="dialogue-text" style="' + style + '">' + text + '</p>';
	else
		dialogueDiv.innerHTML += '<p class="dialogue-text">' + text + '</p>';
}