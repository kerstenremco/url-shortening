let url = document.getElementById("url");
let submit = document.getElementById("submit");
let urlLabel = document.getElementById("urlLabel");
let links = document.getElementById("links");

let apiUrl = "https://api.shrtco.de/v2/shorten?url=";
let errorMessageInvalidUrl = "Geef een geldig url op";
let unknownErrorText = " Er heeft zich een onbekende fout voorgedaan";
let nameLocalStorageobject = "urls";

submit.addEventListener("click", shortenUrl);
links.addEventListener("click", copyLink);

renderList();

function renderList() {
  let ls = getListFromLocalStorage();
  ls.forEach((el) => {
    renderListItem(el[0], el[1]);
  });
}

function renderListItem(originalUrl, shortUrl) {
  let div = document.createElement("div");
  div.classList.add("link");
  let origin = document.createElement("p");
  origin.classList.add("text-2");
  origin.appendChild(document.createTextNode(originalUrl));
  let short = document.createElement("p");
  short.classList.add("short");
  short.classList.add("text-2");
  short.appendChild(document.createTextNode(shortUrl));
  let hr = document.createElement("hr");
  let btn = document.createElement("button");
  btn.type = "button";
  btn.classList.add("text-1");
  btn.appendChild(document.createTextNode("Kopieer"));
  div.appendChild(origin);
  div.appendChild(hr);
  div.appendChild(short);
  div.appendChild(btn);
  links.prepend(div);
}

function addToList(originalUrl, shortUrl) {
  let ls = getListFromLocalStorage();
  ls.push([originalUrl, shortUrl]);
  localStorage.setItem(nameLocalStorageobject, JSON.stringify(ls));
}

function getListFromLocalStorage() {
  return localStorage.getItem(nameLocalStorageobject)
    ? JSON.parse(localStorage.getItem(nameLocalStorageobject))
    : [];
}
function copyLink(e) {
  if (!e.target.type === "button") return;
  let short = e.target.parentElement.querySelector(".short").innerText;
  navigator.clipboard.writeText(short).then((_res) => {
    links.querySelectorAll("button").forEach((btn) => {
      btn.classList.remove("copied");
      btn.innerText = "Kopieer";
    });
    let btn = e.target.parentElement.querySelector("button");
    btn.innerText = "Gekopieerd";
    btn.classList.add("copied");
  });
}

function shortenUrl() {
  // Controleer of URL is ingevuld, als niet -> toon foutmelding en stop
  if (!checkUrl()) return showError(true, errorMessageInvalidUrl);
  // Maak API request
  apiRequest()
    .then((data) => {
      addToList(data.originalUrl, data.shortUrl);
      renderListItem(data.originalUrl, data.shortUrl);
      showError(false);
      url.value = "";
    })
    .catch((err) => {
      console.error(err);
      showError(true);
    });
}

function checkUrl() {
  let reg = /^((https?:\/\/)|www\.)[^\s$.?#].[^\s]*$/gi;
  return url.value.match(reg) ? true : false;
}

function apiRequest() {
  return fetch(`${apiUrl}${url.value}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.ok) throw new Error("Error during API Request");
      return {
        originalUrl: data.result.original_link,
        shortUrl: data.result.short_link,
      };
    });
}

function showError(show, message) {
  let className = "error";
  if (!show) {
    url.classList.remove(className);
    urlLabel.innerText = null;
    return;
  }
  url.classList.add(className);
  urlLabel.innerText = message || unknownErrorText;
}
