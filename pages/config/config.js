var key = {};
if (process.env.NODE_ENV == "production") {
  key = {
    frontUrl: "http://localhost:3000",
    baseUrl: "http://localhost:2025/api",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy.drpc.org",
    chainId: 80002,
    chaincode: "amoy",
  }
} else {
  key = {
    frontUrl: "http://localhost:3000",
    baseUrl: "http://localhost:2025/api",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy.drpc.org",
    chainId: 80002,
    chaincode: "amoy",
    txurl: "https://testnet.bscscan.com",
  };
}
export default key;
