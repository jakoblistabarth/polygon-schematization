class Sector {
  constructor(C, idx, lower, upper) {
    this.C = C;
    this.idx = idx; // horizontal line by default
    this.lower = lower;
    this.upper = upper;
  }

  getBounds() {
    return [this.lower, this.upper];
  }

  getIdx() {
    return this.idx;
  }

  getNeighbors() {
    const sectors = this.C.getSectors();
    const idx = this.getIdx();
    const prev = idx == 0 ? sectors.length - 1 : idx - 1;
    const next = (idx + 1) % sectors.length;
    return [sectors[prev], sectors[next]];
  }

  encloses(angle) {
    const [lowerBound, upperBound] = this.getBounds();
    return angle >= lowerBound && angle <= upperBound;
  }
}

export default Sector;
