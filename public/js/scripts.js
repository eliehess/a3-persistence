const addMember = function(e) {
  e.preventDefault();

  const newMember = {
    firstname: document.getElementById("firstname").value,
    lastname: document.getElementById("lastname").value,
    major: document.getElementById("major").value
  };

  if (!validate(newMember.firstname, newMember.lastname, newMember.major)) {
    document.getElementById("errorBox").style.display = "block";
    return false;
  }
  document.getElementById("errorBox").style.display = "none";

  const body = JSON.stringify(newMember);
  fetch("/submit", {
    method: "POST",
    body
  }).then(function(response) {
    document.getElementById("confirmation").style.display = "flex";
    document.getElementById("application").style.display = "none";
    clear();
  });
  return false;
};

const updateMember = function(e) {
  e.preventDefault();

  const updatedMember = {
    firstname: document.getElementById("updatefirstName").value,
    lastname: document.getElementById("updatelastName").value,
    major: document.getElementById("updateMajor").value,
    uuid: document.getElementById("uuid").value
  };


  if (!validate(updatedMember.firstname, updatedMember.lastname, updatedMember.major)) {
    document.getElementById("updateErrorBox").style.display = "block";
    return false;
  }
  document.getElementById("updateErrorBox").style.display = "none";

  const body = JSON.stringify(updatedMember);
  fetch("/update", {
    method: "POST",
    body
  }).then(function() {
    showMemberTable();
  });
  return false;
};

const validate = function(fName, lName, major) {
  if (fName === "" || lName === "" || major === "") return false;
  else return true;
}

const deleteMember = function(index) {
  const member = JSON.parse(decodeURIComponent(document.getElementById(`deleteMemberButton-${index}`).dataset.string));
  const id = member.uuid;
  console.log("Deleting ID: " + id);
  const memberNum = {
    uuid: id
  };

  const body = JSON.stringify(memberNum);
  fetch("/delete", {
    method: "POST",
    body
  });
  getMembers();
};

const getMembers = async function() {
  const resp = await fetch("/getdata", {
    method: "GET"
  });
  const data = await resp.json();
  const memberList = data.data;

  let table = document.getElementById("memberTable");
  table.innerHTML = "<tr>\n" +
    "<th>First Name</th>\n" +
    "<th>Last Name</th>\n" +
    "<th>Major</th>\n" +
    "<th>Update</th>\n" +
    "<th>Delete</th>\n" +
    "</tr>";

  for (let i = 0; i < memberList.length; i++) {
    const member = memberList[i];
    const str = JSON.stringify(memberList[i]);
    table.innerHTML += "<tr>\n" +
      `<td> ${member.firstname} </td>\n` +
      `<td> ${member.lastname} </td>\n` +
      `<td> ${member.major} </td>\n` +
      `<td> <button id="updateMemberButton-${i}" style="font-size: 1vw"` +
      ` onclick="showUpdate(${i})" data-string=` +
      encodeURIComponent(str) + `>Update</button> </td>\n` +
      `<td> <button id="deleteMemberButton-${i}" style="font-size: 1vw"` +
      ` onclick="deleteMember(${i})" data-string=` +
      encodeURIComponent(str) + `>Delete</button> </td>\n` +
      "</tr>";
  }
  return false;
};

const hideAll = function() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("memberTableDiv").style.display = "none";
  document.getElementById("application").style.display = "none";
  document.getElementById("updateApplication").style.display = "none";
  document.getElementById("confirmation").style.display = "none";
  document.getElementById("errorBox").style.display = "none";
  document.getElementById("updateErrorBox").style.display = "none";
  document.getElementById("loginScreenButton").style.display = "none";
  document.getElementById("switchModeButton").style.display = "none";
}

const login = function() {

}

const clear = function() {
  document.getElementById("firstname").value = "";
  document.getElementById("lastname").value = "";
  document.getElementById("major").value = "";
  return false;
};

const showLogin = function() {
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("memberTableDiv").style.display = "none";
  document.getElementById("application").style.display = "none";
  document.getElementById("updateApplication").style.display = "none";
  document.getElementById("confirmation").style.display = "none";
  document.getElementById("errorBox").style.display = "none";
  document.getElementById("updateErrorBox").style.display = "none";
  document.getElementById("loginScreenButton").style.display = "none";
};

const showApplication = function() {
  document.getElementById("errorBox").style.display = "none";
  document.getElementById("updateErrorBox").style.display = "none";
  document.getElementById("memberTableDiv").style.display = "none";
  document.getElementById("updateApplication").style.display = "none";
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("confirmation").style.display = "none";
  document.getElementById("application").style.display = "block";
  document.getElementById("loginScreenButton").style.display = "block";

  document.getElementById("switchModeButton").innerHTML = "View Members";
  document.getElementById("switchModeButton").onclick = showMemberTable;
  document.getElementById("switchModeButton").style.display = "block";
  clear();
  return false;
};

const showMemberTable = function() {
  document.getElementById("memberTableDiv").style.display = "flex";
  document.getElementById("application").style.display = "none";
  document.getElementById("updateApplication").style.display = "none";
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("confirmation").style.display = "none";
  document.getElementById("errorBox").style.display = "none";
  document.getElementById("updateErrorBox").style.display = "none";
  document.getElementById("loginScreenButton").style.display = "block";

  document.getElementById("switchModeButton").innerHTML = "New Application";
  document.getElementById("switchModeButton").onclick = showApplication;
  document.getElementById("switchModeButton").style.display = "block";
  getMembers();
  return false;
};

const showUpdate = function(index) {
  const member = JSON.parse(decodeURIComponent(document.getElementById(`updateMemberButton-${index}`).dataset.string));

  document.getElementById("memberTableDiv").style.display = "none";
  document.getElementById("updateApplication").style.display = "block";
  document.getElementById("application").style.display = "none";
  document.getElementById("switchModeButton").style.display = "none";
  document.getElementById("loginScreenButton").style.display = "block";
  document.getElementById("errorBox").style.display = "none";
  document.getElementById("updateErrorBox").style.display = "none";
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("confirmation").style.display = "none";

  document.getElementById("updateButton").dataset.index = index;
  document.getElementById("updatefirstName").value = member.firstname;
  document.getElementById("updatelastName").value = member.lastname;
  document.getElementById("updateMajor").value = member.major;
  document.getElementById("uuid").value = member.uuid;
  return false;
};

window.onload = function() {
  const submitButton = document.getElementById("submitButton");
  submitButton.onclick = addMember;
  let switchModeButton = document.getElementById("switchModeButton");
  switchModeButton.innerHTML = "View Members";
  switchModeButton.onclick = showMemberTable;
  switchModeButton.style.display = "block";
  const cancelButton = document.getElementById("cancelButton");
  cancelButton.onclick = showMemberTable;
  const updateButton = document.getElementById("updateButton");
  updateButton.onclick = updateMember;
  const newApplicationButton = document.getElementById("newApplicationButton");
  newApplicationButton.onclick = showApplication;
  const loginScreenButton = document.getElementById("loginScreenButton");
  loginScreenButton.onclick = showLogin;
  const loginButton = document.getElementById("loginButton");
  loginButton.onclick = login;

  document.getElementById("application").style.display = "block";
  document.getElementById("updateApplication").style.display = "none";
  document.getElementById("confirmation").style.display = "none";
  document.getElementById("memberTableDiv").style.display = "none";
  document.getElementById("loginScreenButton").style.display = "block";
  document.getElementById("errorBox").style.display = "none";
  document.getElementById("updateErrorBox").style.display = "none";
  document.getElementById("loginScreen").style.display = "none";
};
