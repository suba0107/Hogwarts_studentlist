"use strict";
window.addEventListener("DOMContentLoaded", start);

const HTML = {};
let hackTheSystemState = false;
let studentHouse;
const studenturl = "//petlatkea.dk/2020/hogwarts/students.json";
const familyurl = "//petlatkea.dk/2020/hogwarts/families.json";

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
  HTML.pureBlood = [];
  HTML.halfBlood = [];
  HTML.search = " ";
  document.querySelectorAll(`[data-action="filter"]`).forEach(elm => {
    elm.addEventListener("click", setFilterButton);
  });

  document.querySelectorAll(`[data-action="sort"]`).forEach(elm => {
    elm.addEventListener("click", setSortValue);
  });

  getJson(familyurl, prepareBloodStatus);
}

function prepareBloodStatus(familyList) {
  HTML.pureBlood = familyList.pure;
  HTML.halfBlood = familyList.half;

  getJson(studenturl, prepareObjects);
}

function buildList() {
  let currentList = filterStudents(settings.filter, settings.filterType);
  currentList = sortStudents(settings.sortBy);
  displayList(currentList);
}

function expelStudent(student) {
  const allStudents = HTML.allStudents;
  const expelledArray = HTML.expelledStudentList;
  console.log(HTML.expelledStudentList);
  const index = allStudents.indexOf(student);
  allStudents.splice(index, 1);
  expelledArray.push(student);
  console.log("expel");
  buildList();
}

function setFilterButton() {
  settings.filter = this.dataset.filter;
  settings.filterType = this.dataset.type;
  buildList();
}

function setShowButton() {
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
  } else if (settings.filter === "searching") {
    const result = HTML.currentStudentList;
    return result;
  } else {
    const result = HTML.allStudents.filter(filterFunction);
    HTML.currentStudentList = result;

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

async function getJson(url, callback) {
  let jsonData = await fetch(url);
  let jsonObjects = await jsonData.json();
  // showList();
  // themeSelector();
  // prepareObjects(jsonObjects);

  callback(jsonObjects);
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
    //console.log(student);

    if (student.house === "slytherin" || student.bloodStatus === "Pureblood") {
      student.inq_squad = Student.inq_squad;
    }
    buildList();
  });
}
document.querySelector("#search_text").addEventListener("input", searchFunction);
function bloodStatus(student) {
  function checkBlood(list) {
    return student.lastname == list;
  }
  const pure = HTML.pureBlood.some(checkBlood);
  const half = HTML.halfBlood.some(checkBlood);

  if (hackTheSystemState) {
    console.log("bloodstatus hacked");
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

function searchFunction() {
  console.log("SearchFunction");
  const inputValue = this.value;
  console.log(HTML.allStudents.firstname);
  inputValue.toLowerCase();
  HTML.currentStudentList = [];
  settings.filter = "searching";
  HTML.allStudents.forEach(searching);

  function searching(student) {
    console.log(` Hej ${inputValue}`);
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
      HTML.currentStudentList.push(student);
      console.log(HTML.currentStudentList);
      buildList();
    }
  }
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
  showListInformation(student);
  student.forEach(displayStudent);
}

function displayStudent(student) {
  if (hackTheSystemState) {
    student.bloodStatus = bloodStatus(student);
  }
  //create clone
  const clone = HTML.temp.content.cloneNode(true);
  //set clone data
  clone.querySelector(".name").textContent = student.firstname + " " + student.lastname;
  clone.querySelector(".house").textContent = student.house;

  // TODO: Show prefect add and remove button
  // TODO addEventlisteners to button
  clone.querySelector(".name").addEventListener("click", function clickList() {
    showSingle(student);
    themeSelector(student);
    clone.querySelectorAll(".name").forEach(elm => {
      elm.removeEventListener("click", clickList);
    });
  });

  clone.querySelector("#read_more").addEventListener("click", function clickList() {
    showSingle(student);
    themeSelector(student);
    clone.querySelectorAll("#read_more").forEach(elm => {
      elm.removeEventListener("click", clickList);
    });
  });

  if (student.prefect == true) {
    console.log("wtf");
    clone.querySelector("[data-field=makePrefect]").textContent = "Remove as prefect";
  } else if (student.prefect == false) {
    clone.querySelector("[data-field=makePrefect]").textContent = "Make prefect";
  }
  clone.querySelector("[data-field=makePrefect]").addEventListener("click", function clickPrefect() {
    clone.querySelectorAll("[data-field=makePrefect]").forEach(elm => {
      elm.removeEventListener("click", clickPrefect);
    });
    makePrefect(student);
  });

  squadHandler();
  function squadHandler() {
    if (student.inq_squad == true) {
      clone.querySelector("[data-field=inqSquad]").textContent = "Remove from the inquisitorial squad";
    } else if (student.inq_squad == false) {
      clone.querySelector("[data-field=inqSquad]").textContent = "Add to the inquisitorial squad";
    } else {
      clone.querySelector("[data-field=inqSquad]").style.display = "none";
    }

    clone.querySelector(`[data-field="inqSquad"]`).addEventListener("click", function clickSquad() {
      clone.querySelectorAll(`[data-field="winner"]`).forEach(elm => {
        elm.removeEventListener("click", clickSquad);
      });
      squadToggle(student);
    });
  }

  // console.log(student.prefect);
  // if (student.prefect == true) {
  //   console.log("wtf");
  //   clone.querySelector("#make_prefect").textContent = "Remove as prefect";
  // } else if (student.prefect == false) {
  //   clone.querySelector("#make_prefect").textContent = "Hej";
  // }

  //append clone to list
  HTML.list.appendChild(clone);
}

function showListInformation(list) {
  const gryf = filterStudents("gryffindor", "house");
  const hufl = filterStudents("hufflepuff", "house");
  const rave = filterStudents("ravenclaw", "house");
  const slyt = filterStudents("slytherin", "house");
  document.querySelector("#numberShown").textContent = `The list is currently showing ${list.length} students`;
  document.querySelector("#attStudents").textContent = `Number of attending students: ${HTML.allStudents.length}`;
  document.querySelector("#expStudents").textContent = `Number of expelled students: ${HTML.expelledStudentList.length}`;
  document.querySelector("#gryf").textContent = `Gryffindor: ${gryf.length}`;
  document.querySelector("#hufl").textContent = `Hufflepuff: ${hufl.length}`;
  document.querySelector("#rave").textContent = `Ravenclaw: ${rave.length}`;
  document.querySelector("#slyt").textContent = `Slytherin: ${slyt.length}`;
}

function showSingle(student) {
  document.querySelector("#popup").style.display = "flex";
  document.querySelector(".fullname").textContent = student.firstname + " " + student.nickname + " " + student.middlename + " " + student.lastname;
  document.querySelector(".bloodstatus").textContent = student.bloodStatus;
  document.querySelector(".image").src = `images/${student.image}.png`;
  document.querySelector(".house").textContent = student.house;
  document.querySelector(".expel").addEventListener("click", function expel() {
    closeSingle();
    buildList();
    document.querySelector(".expel").removeEventListener("click", expel);
    setTimeout(() => {
      expelStudent(student);
    }, 1000);
  });

  document.querySelector("#popup .close").addEventListener("click", closeSingle);
}

function makePrefect(student) {
  console.log("student house : " + student.house);
  const studentsInHouse = filterStudents(student.house, "house");
  console.log(studentsInHouse);
  const prefects = studentsInHouse.filter(checkStudent);
  console.log("prefects" + prefects);
  const prefect1 = HTML.allStudents.indexOf(prefects[0]);
  console.log(prefect1);
  const prefect2 = HTML.allStudents.indexOf(prefects[1]);

  console.log(prefects);
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
    console.log("is same gender " + sameGender);
    // alert("Der er allerede 1 dyr af samme type, der er vinder!");
    showDialogOneOfGender(student);
    // alert("Already a prefect of same gender!");
  } else if (prefects.length > 1) {
    showDialogOnlyTwoPrefects(student);
    console.log("already 2" + prefects.length);
  } else {
    student.prefect = true;
    buildList();
  }

  function showDialogOneOfGender(student) {
    document.querySelector("#onlyone").classList.add("show");
    document.querySelector("#onlyone .closebtn").addEventListener("click", function clickClose() {
      document.querySelector("#onlyone").classList.remove("show");
      document.querySelector("#onlyone .closebtn").removeEventListener("click", clickClose);
      console.log("clicked");
    });

    if (prefects[0].gender === student.gender) {
      console.log("post name" + prefects[0].firstname);
      document.querySelector("#onlyone .student1").textContent = `${prefects[0].firstname} ${prefects[0].lastname}`;
    } else if (prefects[1].gender === student.gender) {
      console.log("post name" + prefects[1].firstname);
      document.querySelector("#onlyone .student1").textContent = `${prefects[1].firstname} ${prefects[1].lastname}`;
    }

    document.querySelector("#onlyone [data-action=remove1]").addEventListener("click", clickRemove1);
    function clickRemove1() {
      document.querySelector("#onlyone [data-action=remove1]").removeEventListener("click", clickRemove1);
      //   console.log(winners[0].winner);
      if (prefects[0].gender == student.gender) {
        console.log("Virk nu...");
        console.log("Hej" + HTML.allStudents[prefect1]);
        HTML.allStudents[prefect1].prefect = false;
        student.prefect = true;
      } else if (prefects[1].gender == student.gender) {
        HTML.allStudents[prefect2].prefect = false;
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
      // document.querySelector("#onlyonekind [data-action=remove1]").removeEventListener("click", remove1);
      console.log(HTML.allStudents[prefect1]);
      HTML.allStudents[prefect1].prefect = false;
      student.prefect = true;
      document.querySelector("#onlytwoprefects").classList.remove("show");
      // decideWinner(animal);
      console.log("clicked remove 1");
      buildList();
    }

    function remove2() {
      document.querySelector("#onlytwoprefects [data-action=remove2]").removeEventListener("click", remove2);
      document.querySelector("#onlytwoprefects [data-action=remove1]").removeEventListener("click", remove1);
      // document.querySelector("#onlyonekind [data-action=remove1]").removeEventListener("click", remove2);
      HTML.allStudents[prefect2].prefect = false;
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
  document.querySelector("#popup .close").removeEventListener("click", closeSingle);
}

function themeSelector(student) {
  document.querySelector(".content").dataset.selected = student.house.toLowerCase();
  document.querySelector(".close").dataset.selected = student.house.toLowerCase();
  document.querySelector(".crest").src = `crests/${student.house.toLowerCase()}.png`;
}

function hackTheSystem() {
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

  HTML.allStudents.push(mySelf);
  buildList();
}
