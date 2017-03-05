function stepDivisor(accuracy: number) {
  if (accuracy >= 10) {
    return 10;
  }

  if (accuracy > 5) {
    return 5;
  }

  if (accuracy > 2) {
    return 2;
  }

  return 1;
}

export function linear(desired: number): number {
  const desiredHeight = Math.abs(desired);
  const desiredExp = Math.ceil(Math.log(desiredHeight) / Math.log(10));
  const stepMagnitude = Math.pow(10, desiredExp);
  const step = stepMagnitude / stepDivisor(stepMagnitude / desiredHeight);
  return step;
}
