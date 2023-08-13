// ==UserScript==
// @name         DEBANK DRAWS
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  try to take over the world!
// @author       latyshdev
// @match        https://debank.com/stream/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=debank.com
// @match        *://*/*
// @grant        window.close
// ==/UserScript==

/* ========================================================================= */
const PAUSE = 1000;
const PAUSE_JOIN = 10000;
const USE_RANDOM_PAUSES_BEFORE = false;
const RANDOM_PAUSES_BEFORE_MIN = 1000 * 30 * 1; // 30 sec
const RANDOM_PAUSES_BEFORE_MAX = 1000 * 60 * 5;   // 5 min
const CLOSE_TAB = false;
const CLOSE_ANYWAY = true;
const CLOSE_ANYWAY_AFTER = 1000 * 60 * 15; // 15 min
const MAX_PARTICIPANTS = 300;

// const RATIO = 150; // TODO
let ATTEMPTS = 6;

const XPATH = {
  participants: `//span[contains(., 'participants')]`,
  ready: `//div[@role='dialog']//div[text()='Participate successfully']`,
  joined: `//div[contains(text(), "You’ve joined") and contains(., "Draw result at")]`,
  join: `//button[@aria-disabled and text()='Join the Draw']`,
  joinLuckyDraw: `//button[@aria-disabled and text()='Join the Lucky Draw']`,
  drawEnded: `//div//span[text()='draw has been finished']`,
  follow: `//div[text()='Join the Lucky Draw']//..//button[@aria-disabled="false" and text()='Follow']`,
  completed: `//div[text()='']//..//..//..//div[text()='Completed']`,
  limit_1000: `//div//span[contains(text(), 'maximum limit of following 1000 users')]`,
  limit_100: `//div//span[contains(text(), 'following 100 users')]`,
  limitByDay: `//*[contains(text(), ' hit your 24-hour join Lucy draw limit based on your Web3 Social Ranking')]`,
  notQualified: `//div//div[text()='Not qualified']`,
  errorFinished: `//div//*[text()='draw has been finished']`,
  pleaseAllow: `//div//div[text()='Please allow in your wallet']`,
  error : "//div//*[text()='Error']",
  hidden: "//*[contains(text(), 'This post has been hidden by the author')]",
  responseError: "//div//*[text()='[object Response]']",
  operationRequirements: "//div//*[text()='The user does not meet the operation requirements.']"
};

/* ========================================================================= */
CLOSE_ANYWAY && setInterval(() => {
  CLOSE_TAB && window.close()
}, CLOSE_ANYWAY_AFTER);

setInterval(() => {
  greetings();
}, 15000);

/* ========================================================================= */
(
  async () => {

    while (!getElementByXpath(XPATH.participants, document)) {
      await pause(PAUSE_JOIN);
    }

    if (USE_RANDOM_PAUSES_BEFORE) {
      let randomPause = randomBetweenInt(RANDOM_PAUSES_BEFORE_MIN, RANDOM_PAUSES_BEFORE_MAX);
      await pause(randomPause);
    }

    let ready = getElementByXpath(XPATH.ready, document);
    let joined = getElementByXpath(XPATH.joined, document);
    let completed = getElementByXpath(XPATH.completed, document);

    while (!ready && !joined && !completed && ATTEMPTS > 0) {
      let follow = getElementByXpath(XPATH.follow, document);
      let joinLuckyDraw = getElementByXpath(XPATH.joinLuckyDraw, document);
      let participants = getElementByXpath(XPATH.participants, document);
      let pleaseAllow = getElementByXpath(XPATH.pleaseAllow, document);
      let endedDraw = getElementByXpath(XPATH.drawEnded, document);
      let hidden = getElementByXpath(XPATH.hidden, document);
      ready = getElementByXpath(XPATH.ready, document);
      joined = getElementByXpath(XPATH.joined, document);
      completed = getElementByXpath(XPATH.completed, document);

      let errors = anyErrors();
      if (errors) ATTEMPTS--;

      if (hidden) {
        ready = true;
      }

      if (participants) {
        participants = participants.innerText;
        participants = participants.replace(",", "");
        participants = participants.split("\t")[0];
        participants = parseInt(participants);
        if (participants > MAX_PARTICIPANTS) {
          ready = true;
        }
      }

      if (ready || joined || completed) {
        CLOSE_TAB && window.close();
        break;
      }

      if (pleaseAllow) {
        alert("Нужно подключить кошелек!")
      }

      // Если конец
      if (endedDraw) {
        CLOSE_TAB && window.close();
        break;
      }

      // Если участвовать | Join the Lucky Draw
      // Или подписаться
      if (joinLuckyDraw || follow) {
        if (follow) {
          follow.click();
        }else{
          joinLuckyDraw.click();
        }
        await pause(PAUSE);
        let errors = anyErrors();
        if (errors) ATTEMPTS--;
        ATTEMPTS--;
        await pause(PAUSE_JOIN);
        continue;
      }

      // Если 1000 подписчиков
      let limit_100 = getElementByXpath(XPATH.limit_100, document);
      let limit_1000 = getElementByXpath(XPATH.limit_1000, document);
      if (limit_100 || limit_1000) {
        alert("Слишком много подписок")
        CLOSE_TAB && window.close();
        break;
      }

      // Если запустить | Join the Draw
      let join = getElementByXpath(XPATH.join, document);
      if (join) {
        join.click();
        await pause(PAUSE);
        let errors = anyErrors();
        if (errors) ATTEMPTS--;
        await pause(PAUSE);
        continue;
      }

      await pause(PAUSE);

      function anyErrors(){
        // Если сибил // TODO
        let error = getElementByXpath(XPATH.error, document);
        let responseError = getElementByXpath(XPATH.responseError, document);
        let notQualified = getElementByXpath(XPATH.notQualified, document);
        let finished = getElementByXpath(XPATH.errorFinished, document);
        let hidden = getElementByXpath(XPATH.hidden, document);
        let operationRequirements = getElementByXpath(XPATH.operationRequirements, document);
        let limit_100 = getElementByXpath(XPATH.limit_100, document);
        let limit_1000 =  getElementByXpath(XPATH.limit_1000, document);
        let limitByDay =  getElementByXpath(XPATH.limitByDay, document);

        return (error || notQualified || hidden 
          || operationRequirements || finished
          || limit_100 || limit_1000 || limitByDay) 
           ? true 
           : false;
      }
    }

    CLOSE_TAB && window.close();
  }
)();

/* ========================================================================= */
function getElementByXpath (xpath, frame_document) {
  return document.evaluate(
    xpath,
    frame_document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

/* ========================================================================= */
async function pause(ms) {
  return await new Promise(r=>setTimeout(r, ms));
};

/* ========================================================================= */
function randomBetweenInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min) + min);
};

/* ========================================================================= */
function greetings () {
  console.log("Запущен скрипт от latyshdev для DeBank");
  console.log("Поддержать автора: https://debank.com/profile/0x309da255baedbc3a1bb97e07ca2064dd22aaaccc");
  return;
}