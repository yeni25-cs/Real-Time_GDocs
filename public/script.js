let typingTimer;
let username = "";
const joinBtn = document.getElementById("joinBtn");
const usernameInput = document.getElementById("username");
const socket = new WebSocket(
    `ws://${window.location.host}`
);

const onlineText = document.getElementById("online");
const editor = document.getElementById("editor");

const activityList =
    document.getElementById("activity-list");
const typingStatus =
    document.getElementById("typing-status");

const downloadBtn =
    document.getElementById("downloadPdf");

joinBtn.addEventListener("click", () => {

    username = usernameInput.value;

    if(username.trim() === ""){

        alert("Masukkan nama terlebih dahulu");

        return;
    }

    socket.send(JSON.stringify({
        type: "join",
        username: username
    }));

});

socket.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if (data.type === "online") {

        onlineText.textContent =
            `Online: ${data.count}`;

    }

    if (data.type === "document") {

        editor.value = data.content;

    }
if(data.type === "activity"){

    const li =
        document.createElement("li");

    li.textContent =
        `${data.username} ${data.activity}`;

    activityList.prepend(li);

    while(activityList.children.length > 5){

        activityList.removeChild(
            activityList.lastChild
        );

    }

}
if(data.type === "typing"){

    typingStatus.textContent =
        `${data.username} sedang mengetik...`;

}

if(data.type === "stopTyping"){

    typingStatus.textContent = "";

}

};

editor.addEventListener("input", () => {

    socket.send(JSON.stringify({
        type: "document",
        content: editor.value
    }));

    socket.send(JSON.stringify({
        type: "typing",
        username: username
    }));

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {

        socket.send(JSON.stringify({
            type: "stopTyping",
            username: username
        }));

    }, 2000);

});
downloadBtn.addEventListener(
    "click",
    () => {

        window.open(
            "/download-pdf",
            "_blank"
        );

    }
);