ws = new WebSocket("ws://127.0.0.1:6543/ws?room=23", ["ws", "wss"]);

const btn = document.querySelector("#send-btn");
const input = document.querySelector("#msg-input");
const messageOut = document.querySelector("#msg-output");

let message = "";

btn.addEventListener("click", (event) => {
  let inputMsg = input.value;
  console.log("input msg =>", inputMsg);
  if (inputMsg === "" || inputMsg === undefined || inputMsg === null) {
    alert("Please enter some message!");
  }
  ws.send(inputMsg || "hello");
  inputMsg.value = "";
});

ws.addEventListener("message", (event) => {
  console.log("Message from server:", event);

  const newText = document.createTextNode(event.data);
  messageOut.appendChild(newText);
});

ws.addEventListener("open", (event) => {
  //ws.send("Hello Server!");
  console.log("open event =>", event);
});

addEventListener("close", (event) => {
  console.log("close event event", event);
});
