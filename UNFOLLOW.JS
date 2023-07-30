// ==UserScript==
// @name         DEBANK UNFOLLOW
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       latyshdev
// @match        https://debank.com/profile/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=debank.com
// @match        *://*/*
// ==/UserScript==

/* ========================================================================= */
const PAUSE_UNFOLLOW = 5000; // Пауза в ms (1000 ms = 1 сек);
const AMOUNT_TO_UNFOLLOW = 100; // Количество отписок от 1 до 100
greetings();
/* ========================================================================= */
(
  async () => {
    const USERS = {};
    i = 0;
    document.querySelectorAll('.db-table-row').forEach(l => {
        //console.log(l);
        let rows = l.querySelectorAll('.db-table-cell');
        USERS[i] = {};
        USERS[i].balance = rows[2].innerText;
        USERS[i].balance = USERS[i].balance.replaceAll("$", "");
        USERS[i].balance = USERS[i].balance.replaceAll(",", "");
        USERS[i].balance = parseInt(USERS[i].balance);
        USERS[i].unFollow = rows[5].querySelector('span');
        i++;
        return;
    });
    console.log(USERS);

    let k = 0;
    for (let i = Object.keys(USERS).length - 1; i >= 0 && k < AMOUNT_TO_UNFOLLOW; i--) {
        // console.log(USERS[i].balance, USERS[i].unFollow);
        USERS[i].unFollow.click();
        await pause(PAUSE_UNFOLLOW);
        k++;
    };

    Object.keys(USERS).length > 0 && alert("READY!");
  }
)();

/* ========================================================================= */
async function pause(ms){
   return await new Promise(r=>setTimeout(r, ms)); 
}

/* ========================================================================= */
function greetings () {
  console.log("Запущен скрипт от latyshdev для DeBank");
  console.log("Поддержать автора:", 
    "https://debank.com/profile/0x309da255baedbc3a1bb97e07ca2064dd22aaaccc");
  return;
}