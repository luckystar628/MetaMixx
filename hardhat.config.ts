import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomicfoundation/hardhat-verify";
// import "@nomiclabs/hardhat-etherscan";
import "dotenv/config";

console.log(process.env.PRIVATE_KEY);

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
    },
    bsc_testnet: {
      url: process.env.BSC_TESTNET_RPC,
      chainId: 97,
      gasPrice: 50000000000,
      accounts: [process.env.PRIVATE_KEY!]
    },
    bsc_mainnet: {
      url: process.env.BSC_MAINNET_RPC,
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY!]
    },
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.4.17",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
      {
        version: "0.4.24",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
      {
        version: "0.5.2",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true
          }
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};

export default config;
