let students;
const list = document.querySelector("#list");
const temp = document.querySelector("template");
let studentHouse;
document.addEventListener("DOMContentLoaded", getJson);

async function getJson() {
  let jsonData = await fetch("students1991.json");
  students = await jsonData.json();
  showList();
  themeSelector();
}

function showList() {
  students.forEach(student => {
    let clone = temp.cloneNode(true).content;
    clone.querySelector(".name").textContent = student.fullname;
    clone.querySelector(".house").textContent = student.house;
    list.appendChild(clone);
    list.lastElementChild.addEventListener("click", () => {
      showSingle(student);
    });
  });
}

function showSingle(student) {
  document.querySelector("#popup").style.display = "flex";
  document
    .querySelector("#popup .close")
    .addEventListener("click", closeSingle);
  document.querySelector(".name").textContent = student.fullname;
  document.querySelector(".house").textContent = student.house;
  studentHouse = student.house.toLowerCase();
  themeSelector();
}

function closeSingle() {
  document.querySelector("#popup").style.display = "none";
}

function themeSelector() {
  document.querySelector(".content").dataset.selected = studentHouse;
  document.querySelector(".close").dataset.selected = studentHouse;
  document.querySelector(".crest").src = `crests/${studentHouse}.png`;
}
