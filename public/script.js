const socket = io({
  transports: ["websocket"]
});

const USERS = {
  anshika: "1111",
  nishant: "2222",
  vipul: "3333",
  rohit: "4444",
  neha: "5555",
  aman: "6666"
};


const joinContainer = document.getElementById("join-container");
const chatContainer = document.getElementById("chat-container");
const joinBtn = document.getElementById("join-btn");
const sendBtn = document.getElementById("send-btn");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const messageInput = document.getElementById("message-input");
const messagesDiv = document.getElementById("messages");
const usersDiv = document.getElementById("users");
const joinError = document.getElementById("join-error");

joinBtn.onclick = () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Username and Password are required!");
    return;
  }

  if (!USERS[username]) {
    alert("❌ Invalid Username!");
    return;
  }

  if (USERS[username] !== password) {
    alert("❌ Wrong Password!");
    passwordInput.value = "";
    return;
  }


  socket.emit("join", username);
  joinContainer.classList.add("hidden");
  chatContainer.classList.remove("hidden");
};


// Send message
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit("message", msg);
  messageInput.value = "";
}

// Receive messages
socket.on("old_messages", messages => {
  messages.forEach(msg => {
    const isOwn = msg.user === usernameInput.value.trim();
    addMessage(`${msg.user}: ${msg.text}`, msg.time, isOwn);
  });
});

socket.on("message", data => {
  const isOwn = data.user === usernameInput.value.trim();
  addMessage(`${data.user}: ${data.text}`, data.time, isOwn);
});



// User joined
socket.on("user_joined", username => {
  addSystemMessage(`${username} joined`);
});

// User left
socket.on("user_left", username => {
  addSystemMessage(`${username} left`);
});

// Update user list
socket.on("users_list", users => {
  usersDiv.textContent = `Users (${users.length}/6): ${users.join(", ")}`;
});

// Room full
socket.on("room_full", msg => {
  joinError.textContent = msg;
});

// Helpers
function addMessage(text, time) {
  const div = document.createElement("div");
  div.className = "message";
  
  // Add timestamp if provided
  if (time) {
    const timeStr = new Date(time).toLocaleTimeString();
    div.textContent = `${text} [${timeStr}]`;
  } else {
    div.textContent = text;
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


function addSystemMessage(text) {
  const div = document.createElement("div");
  div.className = "message system";
  div.textContent = text;
  messagesDiv.appendChild(div);
}
