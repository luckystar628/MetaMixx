import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MetaMixModule = buildModule("MetaMixModule", (m) => {
    const Bep20TokenAddress = "0xb947e7EDA4D84304be9811212f28D061915273fc";
    const referralId = "abc123";

    const MetaMex = m.contract("MetaMixx", [referralId, Bep20TokenAddress]);
    return { MetaMex }
});

export default MetaMixModule;