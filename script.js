"use strict";
window.addEventListener("DOMContentLoaded", start);

const HTML = {};

let studentHouse;

const Student = {
  firstname: "",
  lastname: "",
  middlename: "",
  nickname: "",
  image: "",
  house: "",
  inq_squad: ""
  //TODO: Add prefect status and inquisitorial squad
};

const settings = {
  filterType: null,
  filter: null,
  sortBy: "firstname",
  sortDir: "asc",
  list: "attending"
};

function start() {
  HTML.list = document.querySelector("#list");
  HTML.temp = document.querySelector("template");
  HTML.allStudents = [];
  HTML.currentStudentList = [];
  HTML.expelledStudentList = [];
  HTML.search = " ";
  document.querySelectorAll(`[data-action="filter"]`).forEach(elm => {
    elm.addEventListener("click", setFilterButton);
  });

  document.querySelectorAll(`[data-action="sort"]`).forEach(elm => {
    elm.addEventListener("click", setSortValue);
  });
  getJson();
}

function buildList() {
  let currentList = filterStudents(settings.filter, settings.filterType);
  currentList = sortStudents(settings.sortBy);
  displayList(currentList);
}

function expelStudent(student) {
  const allStudents = HTML.allStudents;
  const expelledArray = HTML.expelledStudentList;
  expelledArray.push(student);
  console.log(HTML.expelledStudentList);
  const index = allStudents.indexOf(student);
  allStudents.splice(index, 1);
  console.log("expel");
  buildList();
}

function setFilterButton() {
  settings.filter = this.dataset.filter;
  settings.filterType = this.dataset.type;
  buildList();
}

function setShowButton() {
  // settings.filter = this.dataset.filter;
  // settings.filterType = this.dataset.type;
  buildList();
}

function setSortValue() {
  //TO DO: get the value(s) from the sort button clicked on
  // ==> what to sort on
  // ==> which direction

  const sortBy = this.dataset.sort;
  settings.sortBy = sortBy;

  const sortDir = this.dataset.sortDirection;
  settings.sortDir = sortDir;

  toggleSortArrows(sortBy);
}

function toggleSortArrows(sortBy) {
  //TO DO: Receive button and direction values
  //if this button is not already sorted, set button values on every sort button to "sort" (call a clear function)
  //set clicked button to "sorted"
  // if already sorted and direction is set to "asc", set diretion to "desc" - else set direction to asc

  let sortName = document.querySelector(`[data-sort="${sortBy}"]`);
  if (sortName.dataset.action === "sort") {
    clearAllSort();
    sortName.dataset.action = "sorted";
  } else {
    if (sortName.dataset.sortDirection === "asc") {
      sortName.dataset.sortDirection = "desc";
      settings.sortDir = "desc";
    } else {
      sortName.dataset.sortDirection = "asc";
      settings.sortDir = "asc";
    }
  }
  buildList();
}

function sortStudents(sortBy) {
  //Sort array using a compare function
  let sortName = document.querySelector(`[data-sort="${sortBy}"]`);
  const sortList = HTML.currentStudentList.sort(compareFunction);

  function compareFunction(a, b) {
    if (sortName.dataset.sortDirection == "asc") {
      if (a[sortBy] < b[sortBy]) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a[sortBy] > b[sortBy]) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  return sortList;
  // filterStudents(button, type);
}

function clearAllSort() {
  // set all buttons to "sort" instead of "sorted"

  document.querySelectorAll(`[data-action="sorted"]`).forEach(botton => {
    botton.dataset.action = "sort";
  });
}

function filterStudents(filter, type) {
  if (settings.filter === "expelled") {
    console.log("expelled");
    const result = HTML.expelledStudentList;
    HTML.currentStudentList = result;
    return result;
  } else {
    const result = HTML.allStudents.filter(filterFunction);
    HTML.currentStudentList = result;
    return result;
  }
  // console.log(filter);
  function filterFunction(student) {
    const filterType = student[type];
    if (filterType == filter) {
      return true;
    } else if (filter === "*") {
      return true;
    }
  }
}

async function getJson() {
  let jsonData = await fetch("https://petlatkea.dk/2020/hogwarts/students.json");
  let jsonObjects = await jsonData.json();
  // showList();
  // themeSelector();
  prepareObjects(jsonObjects);
}

function prepareObjects(jsonObjects) {
  jsonObjects.forEach(jsonObject => {
    const student = Object.create(Student);
    HTML.allStudents.push(student);
    const fullName = jsonObject.fullname;
    let house = jsonObject.house;
    const houseToLowerCase = house.toLowerCase();
    house = houseToLowerCase.trim();
    house = house.charAt(0).toUpperCase() + house.slice(1);
    const fullNameToLowerCase = fullName.toLowerCase();
    let trimFullName = fullNameToLowerCase.trim();
    const search = '"';
    const indexOfFirst = trimFullName.indexOf(search);
    const hyphenSplit = trimFullName.split("-");
    let fullNameHyphen;
    if (trimFullName.includes("-") == true) {
      fullNameHyphen = hyphenSplit[1].charAt(0).toUpperCase() + hyphenSplit[1].slice(1);
      hyphenSplit[1] = "-" + fullNameHyphen;
    }
    const fullNameJoined = hyphenSplit.join();
    trimFullName = fullNameJoined.replace(",", "");
    const indexOfLast = trimFullName.lastIndexOf(search);
    const nickNameSubstring = trimFullName.substring(indexOfFirst - 1, indexOfLast + 1);
    const nickNameTrimmed = nickNameSubstring.replace(/"/g, "").trim();
    const fullNameWithoutNickName = trimFullName.replace(nickNameSubstring, "");
    const fullNameSplit = fullNameWithoutNickName.split(" ");
    const fullNameArray = [];
    for (let i = 0; i < fullNameSplit.length; i++) {
      fullNameSplit[i].charAt(0).toUpperCase() + fullNameSplit[i].slice(1);
      fullNameArray.push(fullNameSplit[i].charAt(0).toUpperCase() + fullNameSplit[i].slice(1));
    }
    const firstName = fullNameArray[0];
    let lastName;
    if (fullNameArray.length > 1) {
      lastName = fullNameArray[fullNameArray.length - 1];
    } else {
      lastName = "";
    }
    fullNameArray.pop();
    fullNameArray.shift();
    const middleNameJoin = fullNameArray.join();
    const middleName = middleNameJoin.replace(",", " ");
    const nickName = nickNameTrimmed.charAt(0).toUpperCase() + nickNameTrimmed.slice(1);

    student.image = displayImage(firstName, lastName);
    student.firstname = firstName;
    student.lastname = lastName;
    student.middlename = middleName;
    student.nickname = nickName;
    student.house = house.toLowerCase();
    if (student.middlename === "") {
      delete student.middlename;
    }
    if (student.nickname === "") {
      delete student.nickname;
    }
    if (student.lastname === "") {
      delete student.lastName;
    }
    //console.log(student);
    displayList(HTML.allStudents);
  });
}

function displayImage(firstname, lastname) {
  const lastName = lastname.toLowerCase();
  let firstName = firstname[0].toLowerCase();
  if (firstname === "Padma") {
    firstName = "padme";
  } else if (firstname === "Parvati") {
    firstName = "parvati";
  }
  let filename = `${lastName}_${firstName}`;

  return filename;
}

function displayList(student) {
  document.querySelector("#list").innerHTML = "";
  student.forEach(displayStudent);
}

function displayStudent(student) {
  //create clone
  const clone = HTML.temp.content.cloneNode(true);
  //set clone data
  clone.querySelector(".name").textContent = student.firstname + " " + student.lastname;
  clone.querySelector(".house").textContent = student.house;

  // TODO: Show prefect add and remove button
  // TODO addEventlisteners to button
  clone.querySelector(".item").addEventListener("click", function clickList() {
    showSingle(student);
    themeSelector(student);
    clone.querySelectorAll(".item").forEach(elm => {
      elm.removeEventListener("click", clickList);
    });
  });

  //append clone to list
  HTML.list.appendChild(clone);
}

function showSingle(student) {
  document.querySelector("#popup").style.display = "flex";
  document.querySelector("#popup .close").addEventListener("click", closeSingle);
  document.querySelector(".fullname").textContent = student.firstname + " " + student.nickname + " " + student.middlename + " " + student.lastname;

  document.querySelector(".image").src = `images/${student.image}.png`;

  document.querySelector(".house").textContent = student.house;
  document.querySelector(".expel").addEventListener("click", function expel() {
    closeSingle();
    document.querySelector(".expel").removeEventListener("click", expel);
    setTimeout(() => {
      expelStudent(student);
    }, 1000);
  });
}

function closeSingle() {
  document.querySelector("#popup").style.display = "none";
}

function themeSelector(student) {
  document.querySelector(".content").dataset.selected = student.house.toLowerCase();
  document.querySelector(".close").dataset.selected = student.house.toLowerCase();
  document.querySelector(".crest").src = `crests/${student.house.toLowerCase()}.png`;
}
