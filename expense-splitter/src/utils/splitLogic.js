export function splitEqual(amount, members) {
  const share = amount / members.length;

  let balances = {};
  members.forEach(m => balances[m] = -share);

  return balances;
}