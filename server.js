const express = require("express");
const path = require("path");
const db = require("./config/db");
const PDFDocument = require("pdfkit");

const {
Document,
Packer,
Paragraph
}=require("docx");

const http = require("http");
const WebSocket = require("ws");

const app = express();

app.use(
express.static(
path.join(__dirname,"public")
)
);

const server =
http.createServer(app);

const wss =
new WebSocket.Server({
server
});

let onlineUsers=0;

const lastEditLog={};


/* ================= WEBSOCKET ================= */

wss.on(
"connection",
(ws)=>{

onlineUsers++;

console.log(
"User terhubung"
);

broadcastOnlineUsers();

db.query(

"SELECT isi FROM dokumen WHERE id=1",

(err,result)=>{

if(
!err &&
result.length>0
){

ws.send(
JSON.stringify({

type:"document",
content:
result[0].isi

})
);

}

}

);

ws.on(

"message",

(message)=>{

const data=
JSON.parse(
message
);


/* JOIN */

if(
data.type==="join"
){

ws.username=
data.username;

console.log(
data.username+
" bergabung"
);

db.query(

"INSERT INTO aktivitas(username,aktivitas) VALUES(?,?)",

[
data.username,
"Bergabung ke dokumen"
]

);

broadcastActivity(

data.username,
"bergabung ke dokumen"

);

}


/* DOCUMENT */

if(
data.type==="document"
){

db.query(

"UPDATE dokumen SET isi=? WHERE id=1",

[
data.content
]

);

const now=
Date.now();

if(

ws.username &&

(

!lastEditLog[
ws.username
]

||

now-
lastEditLog[
ws.username
]

>10000

)

){

lastEditLog[
ws.username
]=now;


db.query(

"INSERT INTO aktivitas(username,aktivitas) VALUES(?,?)",

[
ws.username,
"mengedit dokumen"
]

);

broadcastActivity(

ws.username,
"mengedit dokumen"

);

}

broadcastDocument(
data.content
);

}


/* TYPING */

if(
data.type==="typing"
){

broadcastTyping(
data.username
);

}


/* STOP TYPING */

if(
data.type==="stopTyping"
){

broadcastStopTyping();

}

}

);


ws.on(
"close",
()=>{

onlineUsers--;

console.log(
"User keluar"
);

broadcastOnlineUsers();

}
);

}
);


/* ================= FUNCTIONS ================= */

function broadcastOnlineUsers(){

const data=
JSON.stringify({

type:"online",
count:
onlineUsers

});

wss.clients.forEach(
client=>{

if(
client.readyState===
WebSocket.OPEN
){

client.send(
data
);

}

}
);

}


function broadcastDocument(
content
){

const data=
JSON.stringify({

type:"document",
content

});

wss.clients.forEach(
client=>{

if(
client.readyState===
WebSocket.OPEN
){

client.send(
data
);

}

}
);

}


function broadcastActivity(
username,
activity
){

const data=
JSON.stringify({

type:"activity",
username,
activity

});

wss.clients.forEach(
client=>{

if(
client.readyState===
WebSocket.OPEN
){

client.send(
data
);

}

}
);

}


function broadcastTyping(
username
){

const data=
JSON.stringify({

type:"typing",
username

});

wss.clients.forEach(
client=>{

if(
client.readyState===
WebSocket.OPEN
){

client.send(
data
);

}

}
);

}


function broadcastStopTyping(){

const data=
JSON.stringify({

type:"stopTyping"
});

wss.clients.forEach(
client=>{

if(
client.readyState===
WebSocket.OPEN
){

client.send(
data
);

}

}
);

}


/* ================= PDF ================= */

app.get(
"/download-pdf",
(req,res)=>{

db.query(

"SELECT isi FROM dokumen WHERE id=1",

(err,result)=>{

if(err){

return res
.status(500)
.send("Error");

}

const content=
result[0]?.isi || "";

const doc=
new PDFDocument();

res.setHeader(

"Content-Type",
"application/pdf"

);

res.setHeader(

"Content-Disposition",
"attachment; filename=dokumen.pdf"

);

doc.pipe(
res
);

doc.fontSize(
16
);

doc.text(
"Flash Docs"
);

doc.moveDown();

doc.fontSize(
12
);

doc.text(
content
);

doc.end();

}

);

}
);


/* ================= DOCX ================= */

app.get(
"/download-docx",
async(req,res)=>{

db.query(

"SELECT isi FROM dokumen WHERE id=1",

async(
err,
result
)=>{

if(err){

return res
.status(500)
.send(
"Error"
);

}

const content=
result[0]?.isi || "";

const doc=
new Document({

sections:[{

children:[

new Paragraph(
content
)

]

}]

});

const buffer=
await Packer.toBuffer(
doc
);

res.setHeader(

"Content-Type",

"application/vnd.openxmlformats-officedocument.wordprocessingml.document"

);

res.setHeader(

"Content-Disposition",

"attachment; filename=dokumen.docx"

);

res.send(
buffer
);

}

);

}
);


/* ================= SERVER ================= */

server.listen(
3000,
"0.0.0.0",
()=>{

console.log(
"Server berjalan di port 3000"
);

}
);