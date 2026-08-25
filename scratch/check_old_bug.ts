function mod360(x: number) {
  return ((x % 360) + 360) % 360;
}

function getHouseForLon(lon: number, cusps: number[]): number {
  for (let i = 1; i <= 12; i++) {
    const cusp = cusps[i];
    const nextCusp = i === 12 ? cusps[1] : cusps[i + 1];
    
    const distance = mod360(nextCusp - cusp);
    const pos = mod360(lon - cusp);
    
    if (pos < distance) {
      return i;
    }
  }
  return 1;
}

const cusps0 = [176.03551726635362, 201.68304801465513, 231.8611789136948, 265.4019545686514, 299.1133103234832, 329.72407697599857, 356.03512047272267, 21.683048014655128, 51.8611789136948, 85.40195456865135, 119.11375988890956, 149.72450513362503];

console.log('Old result:', getHouseForLon(154.37006427070037, cusps0));
