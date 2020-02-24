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
  house: ""

  //TODO: Add prefect status and inquisitorial squad
};

function start() {
  HTML.list = document.querySelector("#list");
  HTML.temp = document.querySelector("template");
  HTML.allStudents = [];
  HTML.currentStudentList = [];
  HTML.search = " ";

  document.querySelectorAll(".filter").forEach(elm => {
    elm.addEventListener("click", setFilterButton);
  });
  getJson();
}

function setFilterButton() {
  const button = this.dataset.filter;
  const type = this.dataset.type;
  filterStudents(button, type);
}

function setSortValue() {
  //TO DO: get the value(s) from the sort button clicked on
  // ==> what to sort on
  // ==> which direction
}

function toggleSortArrows() {
  //TO DO: Receive button and direction values
  //if not already sorted, set button values on every sort button to "sort" (call a clear function)
  //set clicked button to "sorted"
  //Set element as sorted
  // if already sorted and direction is set to "asc", set diretion to "desc" - else set direction to asc
}

function clearAllSort() {
  // set all buttons to "sort" instead of "sorted"
}

function sortFunction() {
  //Sort array using a compare function

  function compareFunction(a, b) {
    // if statements based on direction
  }
}

function filterStudents(filter, type) {
  const result = HTML.allStudents.filter(filterFunction);
  // console.log(filter);
  function filterFunction(student) {
    console.log(`hej ${student.house}`);
    const filterType = student[type];
    if (filterType == filter) {
      return true;
    } else if (filter === "*") {
      return true;
    }
  }
  HTML.currentStudentList = result;
  displayList(HTML.currentStudentList);
  console.log(HTML.currentStudentList);
}

function sortStudents() {}

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
    console.log(student);
    displayList(HTML.allStudents);
  });
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

  //append clone to list
  HTML.list.appendChild(clone);
  list.lastElementChild.addEventListener("click", () => {
    showSingle(student);
    themeSelector(student);
  });
}

function showSingle(student) {
  document.querySelector("#popup").style.display = "flex";
  document.querySelector("#popup .close").addEventListener("click", closeSingle);
  document.querySelector(".fullname").textContent = student.firstname + " " + student.nickname + " " + student.middlename + " " + student.lastname;

  document.querySelector(".house").textContent = student.house;
}

function closeSingle() {
  document.querySelector("#popup").style.display = "none";
}

function themeSelector(student) {
  document.querySelector(".content").dataset.selected = student.house.toLowerCase();
  document.querySelector(".close").dataset.selected = student.house.toLowerCase();
  document.querySelector(".crest").src = `crests/${student.house.toLowerCase()}.png`;
}
