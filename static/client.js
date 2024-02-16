displayView = function (contentView) {
  // to display a view
  var viewContainer = document.getElementById("viewContainer");
  viewContainer.innerHTML = contentView;
};

window.onload = function () {
  //code that is executed as the page is loaded.
  //You shall put your own custom code here.
  //window.alert() is not allowed to be used in your implementation.
  //window.alert("Hello TDDD97!");

  // to skip the sign in if token exists
  // returns null if the token is not set
  token = localStorage.getItem("token");
  signedIn = token != null;
  //var signedIn = false;

  if (!signedIn) {
    var welcomeView = document.getElementById("welcomeview").textContent;
    displayView(welcomeView);
    return;
  }
  // finding the script tag containing the appropriate view
  var profileView = document.getElementById("profileview").textContent;
  displayView(profileView);

  const websocket = new WebSocket("ws://" + location.host + "/echo");

  websocket.onopen = function (event) {
    console.log("WebSocket connection opened.");
  };

  websocket.onerror = function (event) {
    console.error("WebSocket error:", event);
  };

  //get the last active tab from localstorage
  let activeTab = localStorage.getItem("activeProfileViewTab");
  if (activeTab == null) {
    //if last tab null direct it to home tab
    activeTab = "home";
  }

  switch (activeTab) {
    case "home":
      openHome();
      break;
    case "browse":
      openBrowse();
      break;
    case "account":
      openAccount();
      break;
    default:
      console.log("returned to default tab");
      openHome();
  }
};

// check password while signup is the same
function check() {
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/sign_up", true);

  //print("abc");

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      console.log(jsonResponse);
      document.getElementById("signup_message").innerHTML = jsonResponse.msg;
    }
  };

  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  ///// What is the above for?/////

  event.preventDefault();

  intial_pw = document.getElementById("signup-password").value;
  second_pw = document.getElementById("signup-repeatpass").value;

  if (intial_pw != second_pw) {
    document.getElementById("signup_message").innerHTML =
      "Password is not the same";
    return false;
  } else if (intial_pw.length < 8) {
    document.getElementById("signup_message").innerHTML =
      "Password should be equal to or more than 8 characters";
    return false;
  } else {
    document.getElementById("signup_message").innerHTML = "";

    var formData = {
      email: document.getElementById("signup-email").value,
      password: document.getElementById("signup-password").value,
      firstname: document.getElementById("signup-name").value,
      familyname: document.getElementById("signup-familyName").value,
      gender: document.getElementById("signup-gender").value,
      city: document.getElementById("signup-city").value,
      country: document.getElementById("signup-country").value,
    };

    xmlr.send(JSON.stringify(formData));

    // var userinfo = serverstub.signUp(formData);
    //document.getElementById("signup_message").innerHTML = userinfo.message;
    //console.log(userinfo.message);

    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    document.getElementById("signup-repeatpassd").value = "";
    document.getElementById("signup-name").value = "";
    document.getElementById("signup-familyName").value = "";
    document.getElementById("signup-gender").value = "";
    document.getElementById("signup-city").value = "";
    document.getElementById("signup-country").value = "";

    return false;
  }
}

var login_info;

//check login fields and go to next page according to login status
function check_login() {
  event.preventDefault();
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/sign_in", true);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      console.log(jsonResponse);
      document.getElementById("login_message").innerHTML = jsonResponse.msg;

      if (jsonResponse.success == "false") {
        return false; //stay on login screen
      } else {
        localStorage.setItem("token", jsonResponse.token); // login token saved
        localStorage.setItem("email", jsonResponse.email);

        //if success true open next page
        var profileViewContent =
          document.getElementById("profileview").textContent;
        displayView(profileViewContent);
      }

      const websocket = new WebSocket("ws://" + location.host + "/echo");

      websocket.onopen = function (event) {
        console.log("WebSocket connection opened.");

        websocket.send(jsonResponse.token);

        websocket.onmessage = function (message) {
          console.log(message.data);
          if (message.data == "sign_out") {
            setTimeout(function () {
              localStorage.removeItem("token");
              localStorage.removeItem("activeProfileViewTab");

              websocket.close();
              //make the page wait for 2 seconds before redirecting to welcome page
              var welcomeViewScript = document.getElementById("welcomeview");
              var contentView = welcomeViewScript.textContent;
              displayView(contentView);
            }, 2000);
          }
        };
      };

      websocket.onerror = function (event) {
        console.error("WebSocket error:", event);
      };

      //login sucess-opening next page data retrieval and post-tezt retrieval

      console.log(jsonResponse.token);
      data_retrival(jsonResponse.token);
      text_display(jsonResponse.token);
    }
  };

  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  password_entered = document.getElementById("login-password").value;
  email_entered = document.getElementById("login-email").value;

  //login_info = serverstub.signIn(email_entered, password_entered);
  // console.log(login_info);
  //document.getElementById("login_message").innerHTML = login_info.message;

  xmlr.send(
    JSON.stringify({ email: email_entered, password: password_entered })
  );
}

function openHome() {
  let token = localStorage.getItem("token");
  data_retrival(token);

  document.getElementById("home-content").style.display = "block";
  document.getElementById("browse-content").style.display = "none";
  document.getElementById("account-content").style.display = "none";

  document.getElementById("home-button").style.textDecoration = "underline";
  document.getElementById("browse-button").style.textDecoration = null;
  document.getElementById("account-button").style.textDecoration = null;

  //to track in which tab we left the webapp we save it to local storage with specific key-> activeProfileViewTab
  //(keyword,value)
  localStorage.setItem("activeProfileViewTab", "home");
}

function openBrowse() {
  text_display();

  document.getElementById("home-content").style.display = "none";
  document.getElementById("browse-content").style.display = "block";
  document.getElementById("account-content").style.display = "none";

  document.getElementById("home-button").style.textDecoration = null;
  document.getElementById("browse-button").style.textDecoration = "underline";
  document.getElementById("account-button").style.textDecoration = null;

  localStorage.setItem("activeProfileViewTab", "browse");
}

function openAccount() {
  document.getElementById("home-content").style.display = "none";
  document.getElementById("browse-content").style.display = "none";
  document.getElementById("account-content").style.display = "block";

  document.getElementById("home-button").style.textDecoration = null;
  document.getElementById("browse-button").style.textDecoration = null;
  document.getElementById("account-button").style.textDecoration = "underline";

  localStorage.setItem("activeProfileViewTab", "account");
}

function data_retrival(token) {
  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", "/get_user_data_by_token/" + token, true);
  //alldata = serverstub.getUserDataByToken(token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);

      console.log(jsonResponse);

      document.querySelector("#I1").textContent = jsonResponse.data.firstname;
      document.querySelector("#I2").textContent = jsonResponse.data.familyname;
      document.querySelector("#I3").textContent = jsonResponse.data.gender;
      document.querySelector("#I4").textContent = jsonResponse.data.city;
      document.querySelector("#I5").textContent = jsonResponse.data.country;
      document.querySelector("#I6").textContent = jsonResponse.data.email;
    }
  };

  xmlr.send();
}

function text_save() {
  event.preventDefault();

  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/post_message", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      console.log(jsonResponse);
      document.getElementById("msg_post").innerHTML = jsonResponse.msg;
    }
  };

  text_msg = document.getElementById("text").value;

  if (text_msg != "") {
    document.getElementById("text").value = "";
    //console.log(text_msg);
    //let token = localStorage.getItem("token");
    //alldata = serverstub.getUserDataByToken(token);

    //a = serverstub.postMessage(token, text_msg, alldata.data.email);

    //document.getElementById("msg_post").innerHTML = a.message;
    //} else {
    //  document.getElementById("msg_post").innerHTML = "Cannot be empty";
    //}
    xmlr.send(
      JSON.stringify({
        email: localStorage.getItem("email"),
        message: text_msg,
        token: localStorage.getItem("token"),
      })
    );
  }
}

function text_display(token) {
  //let token = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", "/get_user_messages_by_token/" + token, true);

  //array = serverstub.getUserMessagesByToken(token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let array = JSON.parse(xmlr.responseText);
      array = array.all_messages[0][0];

      array = array.split(";");
      console.log(array);

      var store_value = [];

      if (array.length >= 2) {
        for (let rep = 0; rep < array.length; rep++) {
          store_value[rep] = array[rep];
        }

        // id+text
        for (let rep = 1; rep < array.length; rep++) {
          document.getElementById(
            "text-wall"
          ).innerHTML += `<div id="idChild"> ${array.length - rep}) ${
            store_value[rep]
          } </div>`;
        }
      }
    }
  };

  //console.log(array.data[0].content); there is error here in chrome console!

  xmlr.send();
}

function refresh() {
  document.getElementById("msg_post").innerHTML = "";
  document.getElementById("text-wall").innerHTML = "";
  text_display(localStorage.token);
}

//change password in account tab
function passwordChange() {
  old_password = document.getElementById("old-password").value;
  new_password = document.getElementById("new-change-password").value;
  new_password_repeat = document.getElementById("changed-password").value;

  token_login = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/change_password", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  if (new_password !== new_password_repeat) {
    document.getElementById("password_change_message").innerHTML =
      "Error: New passwords do not match";
    return false; // prevent reload
  }

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      document.getElementById("password_change_message").innerHTML =
        jsonResponse.msg;
    }
  };

  document.getElementById("old-password").value = "";
  document.getElementById("new-change-password").value = "";
  document.getElementById("changed-password").value = "";

  xmlr.send(
    JSON.stringify({
      old_pass: old_password,
      new_pass: new_password,
      token: localStorage.getItem("token"),
    })
  );

  return false; // prevent reload
}

//signout function in account tab
function signout() {
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/sign_out", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      document.getElementById("signout_message").innerHTML = jsonResponse.msg;
    }
  };

  xmlr.send(
    JSON.stringify({
      token: localStorage.getItem("token"),
    })
  );

  localStorage.removeItem("token");
  localStorage.removeItem("activeProfileViewTab");
  setTimeout(function () {
    //make the page wait for 2 seconds before redirecting to welcome page
    var welcomeViewScript = document.getElementById("welcomeview");
    var contentView = welcomeViewScript.textContent;
    displayView(contentView);
  }, 2000);
}

var user;

function userretrive() {
  //retrieve information browse tab
  event.preventDefault();

  user = document.getElementById("user-email").value;
  let token = localStorage.getItem("token");
  alldata = serverstub.getUserDataByEmail(token, user);

  console.log(alldata);

  if (alldata.message == "No such user.") {
    document.getElementById("user-wall").innerHTML = "";
    document.getElementById("retrive_message").innerHTML = alldata.message;
    return;
  } else {
    document.getElementById("retrive_message").innerHTML = "";

    document.getElementById("user-wall").innerHTML = `<div id="home-content">
    <div class="home-info-container">
  <p class = "bold">First Name:</p>
  <p id="I1-"></p>
  <p class = "bold">Family Name:</p>
  <p id="I2-"></p>
  <p class = "bold">Gender:</p>
  <p id="I3-"></p>
  <p class = "bold">City:</p>
  <p id="I4-"></p>
  <p class = "bold">Country:</p>
  <p id="I5-"></p>
  <p class = "bold">Email:</p>
  <p id="I6-"></p>
  </div>
  <br>
  <form>
      <div class="text-area">
          <label for="message-content">Message: </label>
          <input
              type="text"
              id="text-"
              required
              placeholder="Enter your text"
          />
      </div>
      <div id="msg_post-"></div>
      <div class="post-container ">
      <button onclick="other_user_test_save()">post</button>
      </div>
  </form>
  <h2 class="title">All messages posted:</h2>
  <div id="text-wall-"></div>
  <div class="refresh-container ">
  <button onclick="other_user_refresh()">refresh</button>
  </div>

</div>`;

    //console.log(user);
    //alldata = serverstub.getUserDataByEmail(login_info.data, user);
    //console.log(alldata.message);
    //console.log(alldata.data.city);
    document.querySelector("#I1-").textContent = alldata.data.firstname;
    document.querySelector("#I2-").textContent = alldata.data.familyname;
    document.querySelector("#I3-").textContent = alldata.data.gender;
    document.querySelector("#I4-").textContent = alldata.data.city;
    document.querySelector("#I5-").textContent = alldata.data.country;
    document.querySelector("#I6-").textContent = alldata.data.email;

    array = serverstub.getUserMessagesByEmail(token, user);

    console.log(array);
    //console.log(array.data[0].content); there is error here in chrome console!
    var store_value = [];

    for (let rep = 0; rep < array.data.length; rep++) {
      store_value[rep] = array.data[rep].content;
    }

    for (let rep = 0; rep < array.data.length; rep++) {
      document.getElementById("text-wall-").innerHTML += `<div id="idChild"> ${
        array.data.length - rep
      }) ${store_value[rep]} </div>`;
    }
  }
  return false;
}

function other_user_test_save() {
  event.preventDefault();
  text_msg = document.getElementById("text-").value;
  user = document.getElementById("user-email").value;

  if (text_msg != "") {
    document.getElementById("text-").value = "";

    let token = localStorage.getItem("token");
    a = serverstub.postMessage(token, text_msg, user);
    document.getElementById("msg_post-").innerHTML = a.message;
  } else {
    document.getElementById("msg_post-").innerHTML = "Cannot be empty";
  }
  return false;
}

function other_user_refresh() {
  document.getElementById("text-wall-").innerHTML = "";
  document.getElementById("msg_post-").innerHTML = "";
  let token = localStorage.getItem("token");
  array = serverstub.getUserMessagesByEmail(token, user);
  //console.log(array.data[0].content); there is error here in chrome console!
  var store_value = [];

  for (let rep = 0; rep < array.data.length; rep++) {
    store_value[rep] = array.data[rep].content;
  }

  for (let rep = 0; rep < array.data.length; rep++) {
    document.getElementById("text-wall-").innerHTML += `<div id="idChild"> ${
      array.data.length - rep
    }) ${store_value[rep]} </div>`;
  }
  return false;
}
