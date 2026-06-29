let typingTimer;
let username = "";
let hasJoined = false;

const joinBtn =
document.getElementById("joinBtn");

const usernameInput =
document.getElementById("username");

const socket =
new WebSocket(
`ws://${window.location.host}`
);

const onlineText =
document.getElementById("online");

const editor =
document.getElementById("editor");

const activityList =
document.getElementById(
"activity-list"
);

const typingStatus =
document.getElementById(
"typing-status"
);


/* DOWNLOAD MENU */

const downloadBtn=
document.getElementById(
"downloadBtn"
);

const dropdown=
document.querySelector(
".download-dropdown"
);


editor.disabled=true;


/* ================= MASUK ================= */

joinBtn.addEventListener(
"click",
()=>{

if(hasJoined){

return;

}

username=
usernameInput.value.trim();

if(username===""){

alert(
"Masukkan nama terlebih dahulu"
);

return;

}

hasJoined=true;

editor.disabled=false;

joinBtn.disabled=true;

joinBtn.textContent=
"Sudah Masuk";

socket.send(
JSON.stringify({

type:"join",
username:username

})
);

}
);


/* ================= WEBSOCKET ================= */

socket.onmessage=(event)=>{

const data=
JSON.parse(
event.data
);


if(data.type==="online"){

onlineText.textContent=
`Online: ${data.count}`;

}


if(data.type==="document"){

editor.value=
data.content;

}


if(data.type==="activity"){

const li=
document.createElement(
"li"
);

li.textContent=
`${data.username} ${data.activity}`;

activityList.prepend(
li
);

while(
activityList.children.length>5
){

activityList.removeChild(
activityList.lastChild
);

}

}


if(data.type==="typing"){

typingStatus.textContent=
`${data.username} sedang mengetik...`;

}


if(data.type==="stopTyping"){

typingStatus.textContent=
"";

}

};


/* ================= EDITOR ================= */

editor.addEventListener(
"input",
()=>{

if(!hasJoined){

alert(
"Masuk terlebih dahulu"
);

editor.blur();

return;

}

socket.send(
JSON.stringify({

type:"document",
content:
editor.value

})
);

socket.send(
JSON.stringify({

type:"typing",
username:
username

})
);

clearTimeout(
typingTimer
);

typingTimer=
setTimeout(()=>{

socket.send(
JSON.stringify({

type:"stopTyping"

})
);

},2000);

}
);


/* ================= DOWNLOAD MENU ================= */

downloadBtn.addEventListener(

"click",

()=>{

dropdown.classList.toggle(
"show"
);

}

);


document.addEventListener(

"click",

(e)=>{

if(
!e.target.closest(
".download-menu"
)
){

dropdown.classList.remove(
"show"
);

}

}

);


/* PDF */

document
.getElementById("downloadPdf")
.addEventListener(

"click",

async()=>{

try{

const handle=
await window.showSaveFilePicker({

suggestedName:
"Dokumen.pdf",

types:[{

description:"PDF File",

accept:{
"application/pdf":
[".pdf"]
}

}]

});

const response=
await fetch(
"/download-pdf"
);

const blob=
await response.blob();

const writable=
await handle.createWritable();

await writable.write(
blob
);

await writable.close();

}
catch(err){

console.log(
"Batal menyimpan"
);

}

}
);


/* WORD */

document
.getElementById("downloadDocx")
.addEventListener(

"click",

async()=>{

try{

const handle=
await window.showSaveFilePicker({

suggestedName:
"Dokumen.docx",

types:[{

description:"Word File",

accept:{
"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
[".docx"]
}

}]

});

const response=
await fetch(
"/download-docx"
);

const blob=
await response.blob();

const writable=
await handle.createWritable();

await writable.write(
blob
);

await writable.close();

}
catch(err){

console.log(
"Batal menyimpan"
);

}

}
);


/* ================= NEW ================= */

document
.getElementById(
"newDoc"
)

.addEventListener(

"click",

()=>{

window.open(
"/?new=true",
"_blank"
);

}

);
/* ================= OPEN FILE ================= */

const fileInput=
document.getElementById(
"fileInput"
);

document
.getElementById(
"openFile"
)
.addEventListener(

"click",

()=>{

fileInput.click();

}

);


fileInput.addEventListener(

"change",

(event)=>{

const file=
event.target.files[0];

if(!file){

return;

}

const reader=
new FileReader();

reader.onload=
function(e){

editor.value=
e.target.result;


/* kirim realtime */

socket.send(

JSON.stringify({

type:"document",

content:
editor.value

})

);

};

reader.readAsText(
file
);

}

);



/* ================= SAVE A COPY ================= */

document
.getElementById(
"saveCopy"
)
.addEventListener(

"click",

async()=>{

try{

const handle=

await window.showSaveFilePicker({

suggestedName:
"CopyDokumen",

types:[

{

description:
"Word",

accept:{

"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
[".docx"]

}

},

{

description:
"PDF",

accept:{

"application/pdf":
[".pdf"]

}

},

{

description:
"Text",

accept:{

"text/plain":
[".txt"]

}

}

]

});

const extension=

handle.name
.split(".")
.pop();

let response;

if(
extension==="pdf"
){

response=
await fetch(
"/download-pdf"
);

}

else if(
extension==="docx"
){

response=
await fetch(
"/download-docx"
);

}

else{

const blob=
new Blob(

[editor.value],

{

type:
"text/plain"

}

);

const writable=
await handle.createWritable();

await writable.write(
blob
);

await writable.close();

return;

}

const blob=
await response.blob();

const writable=
await handle.createWritable();

await writable.write(
blob
);

await writable.close();

}

catch(err){

console.log(
"Batal menyimpan"
);

}

}

);
/* ================= ACTIVITY DROPDOWN ================= */

const activityBtn =
document.getElementById(
"activityBtn"
);

const activityDropdown =
document.querySelector(
".activity-dropdown"
);

activityBtn.addEventListener(

"click",

(e)=>{

e.stopPropagation();

activityDropdown.classList.toggle(
"show"
);

}

);

document.addEventListener(

"click",

(e)=>{

if(
!e.target.closest(
".activity-menu"
)
){

activityDropdown.classList.remove(
"show"
);

}

}

);