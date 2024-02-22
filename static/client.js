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
  console.log(websocket);

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

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
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
  password_entered = document.getElementById("login-password").value;
  email_entered = document.getElementById("login-email").value;
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/sign_in", true);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      document.getElementById("login_message").innerHTML = jsonResponse.msg;
      console.log(jsonResponse.success);
      if (jsonResponse.success == false) {
        return false; //stay on login screen
      } else {
        localStorage.setItem("token", jsonResponse.data); // login token saved
        localStorage.setItem("email", email_entered);

        //if success true open next page
        var profileViewContent =
          document.getElementById("profileview").textContent;
        displayView(profileViewContent);
      }

      const websocket = new WebSocket("ws://" + location.host + "/echo");

      console.log(websocket);

      websocket.onopen = function (event) {
        console.log("WebSocket connection opened.");
        websocket.send(jsonResponse.data);

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
        console.error("WebSocket readyState:", websocket.readyState);
        console.error("WebSocket URL:", websocket.url);
      };

      //login sucess-opening next page data retrieval and post-tezt retrieval

      data_retrival();
      text_display();
    }
  };

  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  //login_info = serverstub.signIn(email_entered, password_entered);
  // console.log(login_info);
  //document.getElementById("login_message").innerHTML = login_info.message;

  xmlr.send(
    JSON.stringify({ username: email_entered, password: password_entered })
  );
}

function openHome() {
  data_retrival();
  text_display();

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

function data_retrival() {
  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", "/get_user_data_by_token", true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);

      document.getElementById("user-first-name").textContent =
        jsonResponse.data.firstname;
      document.getElementById("user-family-name").textContent =
        jsonResponse.data.familyname;
      document.getElementById("user-gender").textContent =
        jsonResponse.data.gender;
      document.getElementById("user-city").textContent = jsonResponse.data.city;
      document.getElementById("user-country").textContent =
        jsonResponse.data.country;
      document.getElementById("user-mail").textContent =
        jsonResponse.data.email;
    }
  };

  xmlr.send();
}

function text_save() {
  event.preventDefault();

  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/post_message", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      document.getElementById("message-post-response").innerHTML =
        jsonResponse.msg;
    }
  };

  textMessage = document.getElementById("user-text-to-be-posted").value;

  if (textMessage != "") {
    document.getElementById("user-text-to-be-posted").value = "";
    xmlr.send(
      JSON.stringify({
        email: localStorage.getItem("email"),
        message: textMessage,
      })
    );
  } else {
    document.getElementById("message-post-response").innerHTML =
      "Cannot be empty";
  }
}

function text_display() {
  let token = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", "/get_user_messages_by_token", true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let responseData = JSON.parse(xmlr.responseText);
      allMessages = responseData.all_messages;

      for (let rep = 0; rep < allMessages.length; rep++) {
        msgIndex = allMessages.length - rep;
        document.getElementById("text-wall").innerHTML += `
        <div id="message-${msgIndex}"> ${msgIndex}) - ${
          allMessages[msgIndex - 1].message
        } <br>
        <i>posted by: ${allMessages[msgIndex - 1].sender}</i>
        </div>`;
      }
    }
  };

  //console.log(array.data[0].content); there is error here in chrome console!

  xmlr.send();
}

function refresh() {
  //clean the server message and text wall home tab
  document.getElementById("message-post-response").innerHTML = "";
  document.getElementById("text-wall").innerHTML = "";

  text_display();
}

//change password in account tab
function passwordChange() {
  old_password = document.getElementById("old-password").value;
  new_password = document.getElementById("new-change-password").value;
  new_password_repeat = document.getElementById("changed-password").value;

  token = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("PUT", "/change_password", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  xmlr.setRequestHeader("Authorization", token);
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
      oldpassword: old_password,
      newpassword: new_password,
    })
  );

  return false; // prevent reload
}

//signout function in account tab
function signout() {
  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("DELETE", "/sign_out", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      document.getElementById("signout_message").innerHTML = jsonResponse.msg;
      localStorage.removeItem("token");
      localStorage.removeItem("activeProfileViewTab");
      setTimeout(function () {
        //make the page wait for 2 seconds before redirecting to welcome page
        var welcomeViewScript = document.getElementById("welcomeview");
        var contentView = welcomeViewScript.textContent;
        displayView(contentView);
      }, 2000);
    }
  };
  xmlr.send();
}

function userretrive() {
  //retrieve information browse tab
  event.preventDefault();

  userEmail = document.getElementById("user-email").value;
  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();

  xmlr.open("GET", `/get_user_data_by_email/${userEmail}`, true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let responseData = JSON.parse(xmlr.responseText);

      if (responseData.success == false) {
        // if its not sucess
        document.getElementById("user-wall").innerHTML = "";
        document.getElementById("retrive_message").innerHTML = responseData.msg;
        return;
      } else {
        document.getElementById("retrive_message").innerHTML = "";
        //get whole browse tab without information
        var browseTabContent = document.getElementById("browse-tab").innerHTML;
        //browse tab is added to user-wall(whole page)
        //user-wall is empty page in the beginning
        document.getElementById("user-wall").innerHTML = browseTabContent;

        // display other users information in browse tab related fields
        document.getElementById("other_first_name").textContent =
          responseData.data.firstname;
        document.getElementById("other_family_name").textContent =
          responseData.data.familyname;
        document.getElementById("other_gender").textContent =
          responseData.data.gender;
        document.getElementById("other_city").textContent =
          responseData.data.city;
        document.getElementById("other_country").textContent =
          responseData.data.country;
        document.getElementById("other_email").textContent =
          responseData.data.email;

        let xmlr2 = new XMLHttpRequest();
        xmlr2.open("GET", `get_user_messages_by_email/${userEmail}`, true);
        xmlr2.setRequestHeader("Authorization", token);

        xmlr2.onreadystatechange = function () {
          if ((xmlr2.status = 200 && xmlr2.readyState == 4)) {
            let userMessagesData = JSON.parse(xmlr2.responseText);
            let allMessages = userMessagesData.all_messages;

            for (let rep = 0; rep < allMessages.length; rep++) {
              msgIndex = allMessages.length - rep;
              document.getElementById(
                "other-user-text-wall"
              ).innerHTML += `<div id="message-${msgIndex}"> ${msgIndex} - ${
                allMessages[msgIndex - 1].message
              } <br>
              <i>posted by: ${allMessages[msgIndex - 1].sender}</i>
              </div>`;
            }
          }
        };
        xmlr2.send();
      }
    }
  };
  xmlr.send();
  return false;
}

function other_user_test_save() {
  //other user text post
  event.preventDefault();
  textMessageToBePosted = document.getElementById(
    "message-text-to-be-posted"
  ).value;
  otherUserEmail = document.getElementById("user-email").value;

  if (textMessageToBePosted == "") {
    document.getElementById("server-response").innerHTML = "Cannot be empty";
    return false;
  }
  document.getElementById("message-text-to-be-posted").value = "";

  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/post_message", true);
  xmlr.setRequestHeader("Authorization", token);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let responseData = JSON.parse(xmlr.responseText);
      document.getElementById("server-response").innerHTML = responseData.msg;
    }
  };
  xmlr.send(
    JSON.stringify({
      email: otherUserEmail,
      message: textMessageToBePosted,
    })
  );
  return false;
}

function other_user_refresh() {
  //refresh message wall browse tab
  document.getElementById("server-response").innerHTML = "";
  document.getElementById("message-text-to-be-posted").innerHTML = "";
  document.getElementById("other-user-text-wall").innerHTML = "";
  userMail = document.getElementById("user-email").value;
  let token = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", `get_user_messages_by_email/${userEmail}`, true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if ((xmlr.status = 200 && xmlr.readyState == 4)) {
      let userMessagesData = JSON.parse(xmlr.responseText);
      allMessages = userMessagesData.all_messages;

      for (let rep = 0; rep < allMessages.length; rep++) {
        msgIndex = allMessages.length - rep;
        document.getElementById(
          "other-user-text-wall"
        ).innerHTML += `<div id="message-${msgIndex}"> ${msgIndex} - ${
          allMessages[msgIndex - 1].message
        } <br>
        <i>posted by: ${allMessages[msgIndex - 1].sender}</i>
        </div>`;
      }
    }
  };
  xmlr.send();
}
