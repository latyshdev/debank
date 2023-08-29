// ==UserScript==
// @name         DEBANK UNFOLLOW
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  try to take over the world!
// @author       latyshdev
// @match        https://debank.com/profile/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=debank.com
// @match        *://*/*
// ==/UserScript==

/* ========================================================================= */
const PAUSE_UNFOLLOW = 10000; // Пауза в ms (1000 ms = 1 сек);
const NETWORTH_DONT_UNFOLLOW = 1500;  // Размер банка, держим в подписках
/* ========================================================================= */
greetings();
(
  async () => {
    const USERS = {};
    i = 0;
    document.querySelectorAll('.db-table-row').forEach(l => {
        // console.log(l);
        let rows = l.querySelectorAll('.db-table-cell');
        USERS[i] = {};
        USERS[i].balance = rows[2].innerText;
        USERS[i].balance = USERS[i].balance.replaceAll("$", "");
        USERS[i].balance = USERS[i].balance.replaceAll(",", "");
        USERS[i].balance = parseInt(USERS[i].balance);
        USERS[i].unFollow = rows[rows.length - 1].querySelector('span');
        i++;
        return;
    });
    // console.log(USERS);

    let unFollowUsersArray = Object.keys(USERS).filter(user => {
      return USERS[user].balance < NETWORTH_DONT_UNFOLLOW
    });

    unFollowUsersArray = unFollowUsersArray.reverse();
    // console.log(unFollowUsersArray);

    for await (let user of unFollowUsersArray) {
      console.log(USERS[user]);
      USERS[user].unFollow.click();
      await pause(PAUSE_UNFOLLOW);
    }

    // Object.keys(USERS).length > 0 && alert("READY!");
    return;
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
    "https://debank.com/profile/0x99984bbff08c169796e1b070cffcb3795faf9999");
  return;
}