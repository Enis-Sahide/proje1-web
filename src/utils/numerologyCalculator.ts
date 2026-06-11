export const reduceToSingleDigit = (num: number): number => {
  let sum = num;
  // Reduce until it's 1-9. Astroseek mostly reduces master numbers for the main text too,
  // but we can keep 11, 22, 33 if we want. Let's just follow standard 1-9 reduction for the Astroseek style
  // unless it matches exactly 11, 22, 33.
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
};

// Also sometimes we need absolute single digit (like personal year)
export const absoluteSingleDigit = (num: number): number => {
  let sum = num;
  while (sum > 9) {
    sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
};

export const calculateLifePath = (dateStr: string) => {
  // dateStr format: YYYY-MM-DD
  const parts = dateStr.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);

  const sum = year.toString().split('').reduce((a, b) => a + parseInt(b), 0) +
              month.toString().split('').reduce((a, b) => a + parseInt(b), 0) +
              day.toString().split('').reduce((a, b) => a + parseInt(b), 0);
              
  return {
    number: reduceToSingleDigit(sum),
    calculationString: `${day}.${month}.${year} = ${day.toString().split('').join(' + ')} + ${month.toString().split('').join(' + ')} + ${year.toString().split('').join(' + ')} = ${sum} = ${sum.toString().split('').join(' + ')} = ${absoluteSingleDigit(sum)}`
  };
};

export const calculatePersonalYear = (dateStr: string, currentYear: number = new Date().getFullYear()) => {
  const parts = dateStr.split('-');
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);

  const sum = currentYear.toString().split('').reduce((a, b) => a + parseInt(b), 0) +
              month.toString().split('').reduce((a, b) => a + parseInt(b), 0) +
              day.toString().split('').reduce((a, b) => a + parseInt(b), 0);

  return {
    number: absoluteSingleDigit(sum),
    calculationString: `${day} + ${month} + ${currentYear.toString().split('').join(' + ')} = ${sum} = ${sum.toString().split('').join(' + ')} = ${absoluteSingleDigit(sum)}`
  };
};

export const calculateArrows = (dateStr: string) => {
  const digits = dateStr.replace(/-/g, '').replace(/^0+/, '').split('').map(d => parseInt(d)).filter(d => d !== 0);
  const hasDigit = (d: number) => digits.includes(d);
  const arrowKeys = [];
  const emptyArrowKeys = [];

  if (hasDigit(1) && hasDigit(5) && hasDigit(9)) arrowKeys.push("1-5-9");
  if (hasDigit(3) && hasDigit(5) && hasDigit(7)) arrowKeys.push("3-5-7");
  if (hasDigit(1) && hasDigit(2) && hasDigit(3)) arrowKeys.push("1-2-3");
  if (hasDigit(4) && hasDigit(5) && hasDigit(6)) arrowKeys.push("4-5-6");
  if (hasDigit(7) && hasDigit(8) && hasDigit(9)) arrowKeys.push("7-8-9");
  if (hasDigit(1) && hasDigit(4) && hasDigit(7)) arrowKeys.push("1-4-7");
  if (hasDigit(2) && hasDigit(5) && hasDigit(8)) arrowKeys.push("2-5-8");
  if (hasDigit(3) && hasDigit(6) && hasDigit(9)) arrowKeys.push("3-6-9");

  if (!hasDigit(1) && !hasDigit(5) && !hasDigit(9)) emptyArrowKeys.push("1-5-9");
  if (!hasDigit(3) && !hasDigit(5) && !hasDigit(7)) emptyArrowKeys.push("3-5-7");
  if (!hasDigit(1) && !hasDigit(2) && !hasDigit(3)) emptyArrowKeys.push("1-2-3");
  if (!hasDigit(4) && !hasDigit(5) && !hasDigit(6)) emptyArrowKeys.push("4-5-6");
  if (!hasDigit(7) && !hasDigit(8) && !hasDigit(9)) emptyArrowKeys.push("7-8-9");
  if (!hasDigit(1) && !hasDigit(4) && !hasDigit(7)) emptyArrowKeys.push("1-4-7");
  if (!hasDigit(2) && !hasDigit(5) && !hasDigit(8)) emptyArrowKeys.push("2-5-8");
  if (!hasDigit(3) && !hasDigit(6) && !hasDigit(9)) emptyArrowKeys.push("3-6-9");

  // Format the date string for arrow visual: e.g. 17.3.1995 -> 1 7 . 3 . 1 9 9 5
  const parts = dateStr.split('-');
  const visualString = `${parseInt(parts[2]).toString().split('').join(' ')} . ${parseInt(parts[1]).toString().split('').join(' ')} . ${parts[0].split('').join(' ')}`;

  return {
    arrowKeys,
    emptyArrowKeys,
    visualString
  };
};

export const getBirthdayNumber = (dateStr: string) => {
  const parts = dateStr.split('-');
  return parseInt(parts[2]);
};
