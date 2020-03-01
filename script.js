"use strict";
window.addEventListener("DOMContentLoaded", start);

const HTML = {};

let hackTheSystemState = false;
let studentHouse;
let allStudents = [];
let currentStudentList = [];
let expelledStudentList = [];

const Student = {
  firstname: "",
  lastname: "",
  middlename: "",
  nickname: "",
  image: "",
  house: "",
  inq_squad: false,
  blood_status: "",
  prefect: false
};

const settings = {
  filterType: null,
  filter: null,
  filtering: null,
  sortBy: "firstname",
  sortDir: "asc",
  list: "attending"
};

function start() {
  HTML.list = document.querySelector("#list");
  HTML.temp = document.querySelector("template");
  HTML.pureBlood = [];
  HTML.halfBlood = [];
  HTML.studenturl = "//petlatkea.dk/2020/hogwarts/students.json";
  HTML.familyurl = "//petlatkea.dk/2020/hogwarts/families.json";
  HTML.search = " ";
  document.querySelectorAll(`[data-action="filter"]`).forEach(elm => {
    elm.addEventListener("click", setFilterButton);
  });

  document.querySelectorAll(`[data-action="sort"]`).forEach(elm => {
    elm.addEventListener("click", setSortValue);
  });

  document.querySelector("#hack").addEventListener("click", hackTheSystem);
  document.querySelector("#search_text").addEventListener("input", searchFunction);

  getJson(HTML.familyurl, prepareBloodStatus);
}

function prepareBloodStatus(familyList) {
  HTML.pureBlood = familyList.pure;
  HTML.halfBlood = familyList.half;

  getJson(HTML.studenturl, prepareObjects);
}

async function getJson(url, callback) {
  let jsonData = await fetch(url);
  let jsonObjects = await jsonData.json();
  callback(jsonObjects);
}

function prepareObjects(jsonObjects) {
  jsonObjects.forEach(jsonObject => {
    const student = Object.create(Student);
    allStudents.push(student);

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
    student.bloodStatus = bloodStatus(student);
    student.gender = jsonObject.gender;
    student.prefect = Student.prefect;

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

    if (student.house === "slytherin" || student.bloodStatus === "Pureblood") {
      student.inq_squad = Student.inq_squad;
    }
    buildList();
  });
}

function expelStudent(student) {
  console.log("Student" + student.firstname);
  console.log(expelledStudentList);
  const index = allStudents.indexOf(student);
  console.log(index);
  allStudents.splice(index, 1);
  expelledStudentList.push(student);
  console.log("expel");
  buildList();
}

// Set buttons from eventlisteners
function setFilterButton() {
  settings.filter = this.dataset.filter;
  settings.filterType = this.dataset.type;
  buildList();
}

function setShowButton() {
  buildList();
}

//FIltering, sorting and search functions

function setSortValue() {
  //TO DO: get the value(s) from the sort button clicked on
  // ==> what to sort on
  // ==> which direction

  const sortBy = this.dataset.sort;
  settings.sortBy = sortBy;

  const sortDir = this.dataset.sortDirection;
  settings.sortDir = sortDir;

  toggleSort(sortBy);
}

function toggleSort(sortBy) {
  //Receives button and direction values
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
  const sortList = currentStudentList.sort(compareFunction);

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
    const result = expelledStudentList;
    currentStudentList = result;
    return result;
  } else if (settings.filtering === "searching") {
    const result = currentStudentList.filter(filterFunction);
    return result;
  } else {
    const result = allStudents.filter(filterFunction);
    currentStudentList = result;

    return result;
  }

  function filterFunction(student) {
    const filterType = student[type];
    if (filterType == filter) {
      return true;
    } else if (filter === "*") {
      return true;
    } else if (filterType === true) {
      return true;
    }
  }
}

function searchFunction() {
  const inputValue = this.value;
  inputValue.toLowerCase();
  currentStudentList = [];
  settings.filtering = "searching";
  allStudents.forEach(searching);

  function searching(student) {
    const firstNameLowerCase = student.firstname.toLowerCase();
    const firstNameUpperCase = student.firstname.toUpperCase();
    const lastNameLowerCase = student.firstname.toLowerCase();
    const lastNameUpperCase = student.firstname.toUpperCase();

    if (
      firstNameLowerCase.includes(inputValue) ||
      student.firstname.includes(inputValue) ||
      firstNameUpperCase.includes(inputValue) ||
      lastNameLowerCase.includes(inputValue) ||
      student.lastname.includes(inputValue) ||
      lastNameUpperCase.includes(inputValue)
    ) {
      currentStudentList.push(student);
      buildList();
    }
  }
}

function bloodStatus(student) {
  // if the system is hacked, then randomize the blood status of the poorbloods, and make all half bloods and muggle borns pureblood.
  // else see if the students last name is in both lists. If yes then make the student poorblood. If the student is in the poorblood list, then make the student poorblood. If the student is only in the half blood list, make the student half blood, and if the student is in either list, make the student muggle born.
  function checkBlood(list) {
    return student.lastname == list;
  }
  const pure = HTML.pureBlood.some(checkBlood);
  const half = HTML.halfBlood.some(checkBlood);

  if (hackTheSystemState) {
    if ((pure && half) || pure) {
      const randomize = Math.floor(Math.random() * Math.floor(3));
      console.log("randomize" + randomize);
      if (randomize === 0) {
        console.log("pureblood");
        return "Pureblood";
      } else if (randomize === 1) {
        console.log("halfblood");
        return "Halfblood";
      } else if (randomize === 2) {
        console.log("muggleborn");
        return "Muggle born";
      }
    } else if (half) {
      return "Pureblood";
    } else {
      return "Pureblood";
    }
  } else {
    if (pure && half) {
      console.log(" not hacked pureblood");
      return "Pureblood";
    } else if (pure) {
      return "Pureblood";
    } else if (half) {
      return "Halfblood";
    } else {
      return "Muggle-born";
    }
  }
}

function displayImage(student) {
  let lastName = student.lastname.toLowerCase();
  let firstName = student.firstname[0].toLowerCase();
  const sameLastName = allStudents.filter(list => list.lastname == student.lastname);
  const hyphen = student.lastname.indexOf("-");
  if (sameLastName.length > 1) {
    firstName = student.firstname.toLowerCase();
  } else if (hyphen > -1) {
    lastName = student.lastname.substring(hyphen + 1, student.lastname.length).toLowerCase();
  }

  let filename = `${lastName}_${firstName}`;

  return filename;
}

function buildList() {
  let currentList = filterStudents(settings.filter, settings.filterType);
  currentList = sortStudents(settings.sortBy);
  displayList(currentList);
}

function displayList(student) {
  document.querySelector("#list").innerHTML = "";
  showListInformation(student);
  student.forEach(displayStudent);
}

function displayStudent(student) {
  if (hackTheSystemState) {
    student.bloodStatus = bloodStatus(student);
  }
  student.image = displayImage(student);
  //create clone
  const clone = HTML.temp.content.cloneNode(true);
  //set clone data
  clone.querySelector(".name").textContent = student.firstname + " " + student.lastname;
  const house = student.house.charAt(0).toUpperCase() + student.house.slice(1);
  clone.querySelector(".house").textContent = house;

  clone.querySelector("#clickArea").addEventListener("click", function clickName() {
    showSingle(student);
    clone.querySelectorAll("#clickArea").forEach(elm => {
      elm.removeEventListener("click", clickName);
    });
  });

  clone.querySelector("#prefect").dataset.house = student.house;

  if (student.prefect == true) {
    clone.querySelector("[data-field=makePrefect]").textContent = "Remove as prefect";
    clone.querySelector("#prefect").style.display = "inline-block";
  } else if (student.prefect == false) {
    clone.querySelector("[data-field=makePrefect]").textContent = "Make prefect";
    clone.querySelector("#prefect").style.display = "none";
  }
  clone.querySelector("[data-field=makePrefect]").addEventListener("click", function clickPrefect() {
    clone.querySelectorAll("[data-field=makePrefect]").forEach(elm => {
      elm.removeEventListener("click", clickPrefect);
    });
    makePrefect(student);
  });
  squadHandler();

  function squadHandler() {
    if (student.hasOwnProperty("inq_squad")) {
      if (student.inq_squad === true) {
        clone.querySelector("[data-field=inqSquad]").textContent = "Remove from the inquisitorial squad";
        clone.querySelector("#inqSquad").style.display = "inline-block";
      } else if (student.inq_squad === false) {
        clone.querySelector("[data-field=inqSquad]").textContent = "Add to the inquisitorial squad";
        clone.querySelector("#inqSquad").style.display = "none";
      }
    } else {
      clone.querySelector("[data-field=inqSquad]").style.display = "none";
      clone.querySelector("#inqSquad").style.display = "none";
    }

    clone.querySelector(`[data-field="inqSquad"]`).addEventListener("click", function clickSquad() {
      clone.querySelectorAll(`[data-field="winner"]`).forEach(elm => {
        elm.removeEventListener("click", clickSquad);
      });
      squadToggle(student);
    });
  }

  // if the user is trying to expel Subangi, then show a dialog box.
  // else remove the student from the list and move them to the list with expelled students.
  clone.querySelector(".expel").addEventListener("click", function expel() {
    if (student.firstname === "Subangi") {
      clone.querySelector("#hackDialog").classList.add("show");
      clone.querySelector("#hackDialog .closebtn").addEventListener("click", function closeBtn() {
        clone.querySelector("#hackDialog .closebtn").removeEventListener("click", closeBtn);
        clone.querySelector("#hackDialog").classList.remove("show");
        clone.querySelectorAll(".expel").forEach(elm => {
          elm.removeEventListener("click", expel);
        });
      });
    } else {
      console.log(student);
      clone.querySelectorAll(".expel").forEach(elm => {
        elm.removeEventListener("click", expel);
      });
      setTimeout(function expelStudentTimed() {
        expelStudent(student);
      }, 500);
    }
  });

  //append clone to list
  HTML.list.appendChild(clone);
}

function showListInformation(list) {
  const gryf = filterStudents("gryffindor", "house");
  const hufl = filterStudents("hufflepuff", "house");
  const rave = filterStudents("ravenclaw", "house");
  const slyt = filterStudents("slytherin", "house");
  document.querySelector("#numberShown").textContent = `The list is showing ${list.length} students`;
  document.querySelector(`[data-filter="*"]`).textContent = `Attending students (${allStudents.length})`;
  document.querySelector(`[data-filter="expelled"]`).textContent = `Expelled (${expelledStudentList.length})`;
  document.querySelector(`[data-filter="gryffindor"]`).textContent = `Gryffindor (${gryf.length})`;
  document.querySelector(`[data-filter="ravenclaw"]`).textContent = `Hufflepuff (${hufl.length})`;
  document.querySelector(`[data-filter="hufflepuff"]`).textContent = `Ravenclaw (${rave.length})`;
  document.querySelector(`[data-filter="slytherin"]`).textContent = `Slytherin (${slyt.length})`;
}

function showSingle(student) {
  console.log(student);
  themeSelector(student);
  document.querySelector("#popup").style.display = "flex";
  document.querySelector(".fullname").textContent = student.firstname + " " + student.nickname + " " + student.middlename + " " + student.lastname;
  document.querySelector(".bloodstatus").textContent = student.bloodStatus;
  document.querySelector(".image").src = `images/${student.image}.png`;
  const house = student.house.charAt(0).toUpperCase() + student.house.slice(1);
  document.querySelector(".house").textContent = house;

  document.querySelector("#prefectSingle").dataset.house = student.house;

  if (student.prefect == true) {
    document.querySelector("#prefectSingle").style.display = "inline-block";
  } else if (student.prefect == false) {
    document.querySelector("#prefectSingle").style.display = "none";
  }

  if (student.hasOwnProperty("inq_squad")) {
    if (student.inq_squad === true) {
      document.querySelector("#inqSquadSingle").style.display = "inline-block";
    } else if (student.inq_squad === false) {
      document.querySelector("#inqSquadSingle").style.display = "none";
    }
  } else {
    document.querySelector("#inqSquadSingle").style.display = "none";
  }
  document.querySelector("#popup .close").addEventListener("click", closeSingle);
}

function makePrefect(student) {
  //if the student is prefect already, remove the prefect badge.
  // else see if there's already a prefect with same gender in the house. If yes, then show a dialog box where the user have to choose whether they would like to replace the current prefect or not.
  // if no, then see if there is two prefects in the same house.
  //if yes, then then show a dialog box where the user have to choose whether they would like to replace one of the current prefects or not.
  // if no, make the student prefect.

  const studentsInHouse = filterStudents(student.house, "house");
  const prefects = studentsInHouse.filter(checkStudent);
  const prefect1 = allStudents.indexOf(prefects[0]);
  const prefect2 = allStudents.indexOf(prefects[1]);
  function checkStudent(student) {
    return student.prefect == true;
  }
  const sameGender = prefects.some(studentGender);
  function studentGender(prefects) {
    return prefects.gender == student.gender;
  }

  if (student.prefect === true) {
    student.prefect = false;
    buildList();
  } else if (sameGender == true) {
    showDialogOneOfGender(student);
  } else if (prefects.length > 1) {
    showDialogOnlyTwoPrefects(student);
  } else {
    student.prefect = true;
    buildList();
  }

  function showDialogOneOfGender(student) {
    document.querySelector("#onlyone").classList.add("show");
    document.querySelector("#onlyone .closebtn").addEventListener("click", function clickClose() {
      document.querySelector("#onlyone").classList.remove("show");
      document.querySelector("#onlyone .closebtn").removeEventListener("click", clickClose);
    });

    if (prefects[0].gender === student.gender) {
      document.querySelector("#onlyone .student1").textContent = `${prefects[0].firstname} ${prefects[0].lastname}`;
    } else if (prefects[1].gender === student.gender) {
      document.querySelector("#onlyone .student1").textContent = `${prefects[1].firstname} ${prefects[1].lastname}`;
    }

    document.querySelector("#onlyone [data-action=remove1]").addEventListener("click", clickRemove1);
    function clickRemove1() {
      document.querySelector("#onlyone [data-action=remove1]").removeEventListener("click", clickRemove1);
      if (prefects[0].gender == student.gender) {
        allStudents[prefect1].prefect = false;
        student.prefect = true;
      } else if (prefects[1].gender == student.gender) {
        allStudents[prefect2].prefect = false;
        student.prefect = true;
        console.log("Kage");
      }
      document.querySelector("#onlyone").classList.remove("show");
      buildList();
    }
  }

  function showDialogOnlyTwoPrefects(student) {
    console.log("showDialogOnlyTwoWinners");
    document.querySelector("#onlytwoprefects").classList.add("show");
    document.querySelector("#onlytwoprefects .closebtn").addEventListener("click", function closeBtn() {
      document.querySelector("#onlytwoprefects .closebtn").removeEventListener("click", closeBtn);
      document.querySelector("#onlytwoprefects").classList.remove("show");
      console.log("clicked close");
    });

    document.querySelector("#onlytwoprefects .student1").textContent = `${prefects[0].firstname} ${prefects[0].lastname}`;
    document.querySelector("#onlytwoprefects .student2").textContent = `${prefects[1].firstname} ${prefects[1].lastname}`;

    document.querySelector("#onlytwoprefects [data-action=remove1]").addEventListener("click", remove1);
    document.querySelector("#onlytwoprefects [data-action=remove2]").addEventListener("click", remove2);

    function remove1() {
      document.querySelector("#onlytwoprefects [data-action=remove1]").removeEventListener("click", remove1);
      document.querySelector("#onlytwoprefects [data-action=remove2]").removeEventListener("click", remove2);
      console.log(allStudents[prefect1]);
      allStudents[prefect1].prefect = false;
      student.prefect = true;
      document.querySelector("#onlytwoprefects").classList.remove("show");
      console.log("clicked remove 1");
      buildList();
    }

    function remove2() {
      document.querySelector("#onlytwoprefects [data-action=remove2]").removeEventListener("click", remove2);
      document.querySelector("#onlytwoprefects [data-action=remove1]").removeEventListener("click", remove1);
      allStudents[prefect2].prefect = false;
      student.prefect = true;
      document.querySelector("#onlytwoprefects").classList.remove("show");
      console.log("clicked remove 2");
      buildList();
    }
  }
}

function squadToggle(student) {
  if (student.inq_squad == true) {
    student.inq_squad = false;
    console.log("false");
  } else {
    student.inq_squad = true;
    if (hackTheSystemState) {
      //When the system is hacked remove a student from the inquisitorial squad when they are added.
      setTimeout(function() {
        student.inq_squad = false;
        buildList();
      }, 2000);
    }
  }
  buildList();
}

function closeSingle() {
  document.querySelector("#popup").style.display = "none";
  document.querySelectorAll("#popup .close").forEach(elm => {
    elm.removeEventListener("click", closeSingle);
  });
  buildList();
}

function themeSelector(student) {
  document.querySelector(".content").dataset.selected = student.house.toLowerCase();
  document.querySelector(".close").dataset.selected = student.house.toLowerCase();
  document.querySelector(".crest").src = `crests/${student.house.toLowerCase()}.png`;
}

function hackTheSystem() {
  // when this function is called, set the state to true.
  // make an object with my name and push into the list.
  hackTheSystemState = true;
  const mySelf = {
    firstname: "Subangi",
    lastname: "Vasantharajan",
    middlename: "",
    nickname: "",
    image: "",
    house: "ravenclaw",
    inq_squad: false,
    prefect: false
  };

  allStudents.push(mySelf);
  buildList();
}
