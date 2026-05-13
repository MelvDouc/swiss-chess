const getPairingInfoSymbol: unique symbol = Symbol();

const Symbols = {
  getPairingInfo: getPairingInfoSymbol
} as const;

export default Symbols;