//io();{will start the server on its own}
//---------------------------------155----------------//
/*
const socket = io();
socket.on("countUpdated", (count) => {
  console.log("The count has been updated!", count);
});
document.querySelector("#increment").addEventListener("click", () => {
  console.log("Clicked");
  socket.emit("increment");
});
*/
//-------------------------------------------//
const socket = io();
// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML; // 161- watch video to understand
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true, // to remove the ? in url string
}); //167-location.search gives the url string from when we login

//173
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild; // getting the new message

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage); // margin value
  const newMessageMargin = parseInt(newMessageStyles.marginBottom); // margin value
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin; // adding margin value to total height

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight; // scrooltop gives us the amount of height we have scrolled from the top

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm:a"), // 163 -moment is an inbuilt library to format the date and time
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm:a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value; //156 - 14:00 to understad this line

  socket.emit("sendMessage", message, (error) => {
    //console.log("The message was delivered ",message); //159
    //159:
    //enable
    $messageFormButton.removeAttribute("disabled"); //160
    $messageFormInput.value = ""; //160
    $messageFormInput.focus(); //160
    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered ");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser."); //158
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/"; //redirecting to login page
  }
}); // 167- username and room t0join
