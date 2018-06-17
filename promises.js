let promiseMoney = new Promise((resolve, reject) => {
  let answer = false;

  if (answer)
    resolve('Money is given');
  else
    reject('No money given');
});

promiseMoney.then((fromResolve) => {
  console.log('Promise Resolved:', fromResolve);
})
.catch((fromReject) => {
  console.log('Promise Not Resolved:', fromReject);
})
