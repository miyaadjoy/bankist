'use strict';

/////////////////////////////////////////////
/////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-10-02T23:36:17.929Z',
    '2023-10-03T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-10-01T18:49:59.371Z',
    '2023-09-28T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSummaryIn = document.querySelector('.summary__value--in');
const labelSummaryOut = document.querySelector('.summary__value--out');
const labelSummaryInterest = document.querySelector(
  '.summary__value--interest'
);
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

////////////////////////////////////////////////////////////////////////////////////////////

//GLOBALS
let currentAccount;
let movementsSorted = false;
let timerRunnig = 0;

//functions
//calculate days passed
const calcDaysPassed = function (date1, date2) {
  return Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
};
//create formatted date
const createFormattedDate = function (date) {
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return `${new Intl.DateTimeFormat(currentAccount.locale).format(date)}`;
};

//format number
const formatCurrency = function (value, locale, currency) {
  const options = {
    style: 'currency',
    currency: currency,
  };
  return new Intl.NumberFormat(locale, options).format(value);
};
//display movements
const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach(function (movement, index) {
    // console.log(`${index + 1}: ${movement}`);
    const date = new Date(currentAccount.movementsDates[index]);

    const formattedDate = createFormattedDate(date);

    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
      <div class="movements__date">${formattedDate}</div>
      <div class="movements__value">${formatCurrency(
        movement,
        currentAccount.locale,
        currentAccount.currency
      )}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
    // console.log(currentAccount.movementsDates[index]);
    // console.log(new Date(currentAccount.movementsDates[index]));
    // console.log(createFormattedDate(new Date(currentAccount.movementsDates[index])));
  });
};

//calculate & display total balance
const calcDisplayBalance = function (account) {
  //calculate the balance
  const balance = account.movements.reduce(
    (accumulator, current) => accumulator + current,
    0
  );
  account.balance = balance;
  //formatting balance
  const formattedBalance = formatCurrency(
    balance,
    account.locale,
    account.currency
  );

  //display the balance
  labelBalance.textContent = `${formattedBalance}`;
};

//calculate & display summaries
const calcDisplaySummaries = function (account) {
  //calculating incomes
  const incomes = account.movements
    .filter(function (movement) {
      return movement > 0;
    })
    .reduce(function (accumulator, movement) {
      return accumulator + movement;
    }, 0);
  //displaying incomes
  labelSummaryIn.textContent = `${formatCurrency(
    incomes,
    account.locale,
    account.currency
  )}`;

  //calculating outcomes
  const outcomes = account.movements
    .filter(function (movement) {
      return movement < 0;
    })
    .reduce(function (accumulator, movement) {
      return accumulator + movement;
    }, 0);
  //display outcomes
  labelSummaryOut.textContent = `${formatCurrency(
    Math.abs(outcomes),
    account.locale,
    account.currency
  )}`;
  //calculate interests
  const interests = account.movements
    .filter(function (movement) {
      return movement > 0;
    })
    .map(function (deposit) {
      return (deposit * account.interestRate) / 100;
    })
    .filter(function (interest) {
      return interest >= 1;
    })
    .reduce(function (accumulator, interest) {
      return accumulator + interest;
    }, 0);
  //display interests
  labelSummaryInterest.textContent = `${formatCurrency(
    interests,
    account.locale,
    account.currency
  )}`;
};

const displayWelcomeMsg = function (currentAccount) {
  labelWelcome.textContent = `Good Afternoon, ${
    currentAccount.owner.split(' ')[0]
  }!`;
};
/**
 *
 * @param {string} name
 */
const createUsernames = function (accounts) {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

//update UI function
const updateUI = function (account) {
  displayMovements(account.movements);
  calcDisplayBalance(account);
  calcDisplaySummaries(account);
};

const displayCurrentDate = function () {
  const currentDate = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(currentDate);
};

//log out timer
const logoutTimer = function () {
  const tick = function () {
    let minute = Math.trunc(time / 60);
    let second = time % 60;
    if (time === 0) {
      clearInterval(intervalId);
      //logout
      //hide ui
      containerApp.style.opacity = '0';
      labelWelcome.textContent = 'Log in to get started';
    }

    labelTimer.textContent = `${minute.toString().padStart(2, 0)}:${(
      second % 60
    )
      .toString()
      .padStart(2, 0)}`;
    time--;
  };

  let time = 600;
  tick();
  const intervalId = setInterval(tick, 1000);
  return intervalId;
};

//event handler functions

//LOGIN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //taking the input values
  //find a user
  currentAccount = accounts.find(function (account) {
    return (
      account.username === inputLoginUsername.value &&
      account.pin === Number(inputLoginPin.value)
    );
  });
  //if the credentials are correct
  if (currentAccount) {
    //display welcome message
    displayWelcomeMsg(currentAccount);
    //display current date
    displayCurrentDate();
    //start logout timer
    if (timerRunnig) clearInterval(timerRunnig);
    timerRunnig = logoutTimer();

    //display ui
    containerApp.style.opacity = '100%';
    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //update ui
    updateUI(currentAccount);
  }
});

//TRANSFER MONEY
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const recipientAccount = accounts.find(function (account) {
    return account.username === inputTransferTo.value;
  });

  const transferAmount = Number(inputTransferAmount.value);
  console.log(transferAmount);
  if (
    transferAmount > 0 &&
    recipientAccount &&
    currentAccount !== recipientAccount &&
    currentAccount.balance >= transferAmount
  ) {
    currentAccount.movements.push(-transferAmount);
    currentAccount.movementsDates.push(new Date().toISOString());
    recipientAccount.movements.push(transferAmount);
    recipientAccount.movementsDates.push(new Date().toISOString());

    // clear input fields
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferAmount.blur();
    //update UI
    updateUI(currentAccount);
    //reset timer
    clearInterval(timerRunnig);
    timerRunnig = logoutTimer();
  }
});

//REQUEST LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const requestedAmount = Math.floor(Number(inputLoanAmount.value));
  const applicable = currentAccount.movements.some(function (movement) {
    return movement >= requestedAmount * 0.1;
  });
  if (applicable) {
    setTimeout(function () {
      currentAccount.movements.push(requestedAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      //update UI
      updateUI(currentAccount);
    }, 3000);
    //reset timer
    clearInterval(timerRunnig);
    timerRunnig = logoutTimer();
  }

  //clear input field
  inputLoanAmount.value = '';
});

//CLOSE ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    //delete user from data
    const index = accounts.findIndex(function (account) {
      return account.username === currentAccount.username;
    });
    accounts.splice(index, 1);

    //hide ui
    containerApp.style.opacity = '0';
    labelWelcome.textContent = 'Log in to get started';
  }

  //clear input fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

//sort movements

btnSort.addEventListener('click', function () {
  if (movementsSorted) {
    displayMovements(currentAccount.movements);
    movementsSorted = false;
  } else {
    const movementsCopy = [...currentAccount.movements];
    movementsCopy.sort((a, b) => a - b);
    displayMovements(movementsCopy);
    movementsSorted = true;
  }
});

//////////////////////////////////////////////
//////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0);
console.log(Number.parseInt('23px', 10));
console.log(Number.parseFloat('3.5rem'));

console.log(0.1 + 0.2);

console.log(Number.isNaN(1));
console.log(Number.isNaN('23'));
console.log(Number.isNaN(+'e45'));
console.log(Number.isNaN(1 / 0));
console.log('=====');

console.log(Number.isFinite(23));
console.log(Number.isFinite('23'));
console.log(Number.isFinite(+'e23'));
console.log(Number.isFinite(1 / 0));

//Number namespace
const str = '1.1 What is going on';
console.log(Number.parseFloat(str));
console.log(Number.isFinite(Number.parseFloat(str)));

//Number is a primitive, we can't call method on a primitive. But JavaScript wraps the Number value into its corresponding Number object. This is called the "Boxing" method.

//Math is a built-in Global object

console.log(Math.sqrt('25')); //It does type coercion
const arr = [3, 7, 11, '19', '1'];
console.log(Math.max(...arr)); //type coercion
console.log(Math.min(...arr)); //type coercion

console.log(Number((Math.PI * Number.parseFloat('15em') ** 2).toFixed(2)));

// 0 --- 1
// 0 --- max - min
// min --- max - min + min
// min --- max
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

console.log(randomInt(10, 20));


labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((curEl, i) => {
    if (i % 2 === 0) curEl.style.backgroundColor = '#d7ffff';
  });
});


//Numeric Seperator
const diameter = 287_460_000_000;

console.log(diameter);

const price = 345_99;

// Illegal Usecases
// console.log(3.1__4159);

console.log(parseInt('230_45'));
console.log(Number('230_45'));


// BigInt
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);

console.log(12345678911125478965321459875n);

// Operations with BigInt

console.log(10n / 3n);
console.log(10n == 10);
console.log(20n > 15);


// console.log(Math.sqrt(11111111111111111111111111111111111111111111111111111111111111111n));


//current date
const currentDate = new Date();
console.log(currentDate);

const day = currentDate.getDate().toString().padStart(2, 0);
const month = (currentDate.getMonth() + 1).toString().padStart(2, 0);
const year = currentDate.getFullYear();
const hour = currentDate.getHours().toString().padStart(2, 0);
const minute = currentDate.getMinutes().toString().padStart(2, 0);
// const second = currentDate.getSeconds();

const formattedDate = `${day}/${month}/${year}, ${hour}:${minute}`;
console.log(formattedDate);


const now = new Date();
console.log(now);
console.log(new Date('2019-11-18T21:31:17.178Z'));
console.log(new Date('December 25, 2019 20:19:45:05'));
console.log(new Date(2037, 10, 5, 7, 59, 45, 99));

//unix time = January 1st, 1970

console.log(new Date(5 * 365 * 24 * 60 * 60 * 1000));
console.log(new Date().getTime()); //       timestamp
console.log(new Date(Date.now()));

console.log(new Date('December 25, 2019').getFullYear());

//ISO string
console.log(new Date().toISOString());
console.log(new Date('2023-10-03T20:26:41.575Z'));

console.log(new Date().getTime());
console.log(new Date(Date.now()));


//Internationalization of Date & Time

const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
};

const formattedDate = new Intl.DateTimeFormat('en-US', options).format(now);

console.log(formattedDate);



//Internationalization of Numbers
const number = 227_559_125.23;
const options = {
  style: 'currency',
  currency: 'EUR',
};

console.log(new Intl.NumberFormat('en-US', options).format(number));
console.log(new Intl.NumberFormat('en-GB', options).format(number));
console.log(new Intl.NumberFormat('de-DE', options).format(number));
console.log(new Intl.NumberFormat('pt-PT', options).format(number));
*/

//setTimeout

const timer = setTimeout(function () {
  console.log('Here is your pizza🍕🍕');
}, 3000);
console.log('waiting...');
clearTimeout(timer);

//setInterval
setInterval(function () {
  const now = new Date();
  labelDate.textContent = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(now);
}, 1000);
