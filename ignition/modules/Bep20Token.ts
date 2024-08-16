import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenName = "Alien Mask";
const tokenSymbol = "ALIEN";
const tokenDecimals = 18;
const tokenTotalSupply: bigint = 1000_000_000n;

const Bep20Module = buildModule("Bep20Module", (m) => {
    const name = m.getParameter("name", tokenName);
    const symbol = m.getParameter("symbol", tokenSymbol);
    const decimals = m.getParameter("decimals", tokenDecimals);
    const totalSupply = m.getParameter("totalSupply", tokenTotalSupply);
    
    const bep20Token = m.contract("BEP20Token", [name, symbol, decimals, totalSupply]);

    return { bep20Token }
    
});

export default Bep20Module;