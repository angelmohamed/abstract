var key = {};
 if (process.env.NODE_ENV == "production") {
  key = {
    frontUrl: "http://localhost:3000",
    baseUrl: "http://localhost:3001/api/v1/user",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy.drpc.org",
    getLoginInfo: "https://ipapi.co/json/",
    chainId: 80002,
    chaincode: "amoy",
    txurl: "https://testnet.bscscan.com",
    clientId: "736868654424-o0358dlqp1853eafackm2edren909e1m.apps.googleusercontent.com"
  }
} else {
  key = {
    frontUrl: "http://localhost:3000",
    baseUrl: "http://localhost:3001/api/v1/user",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy.drpc.org",
    getLoginInfo: "https://ipapi.co/json/",
    chainId: 80002,
    chaincode: "amoy",
    txurl: "https://testnet.bscscan.com",
    clientId: "736868654424-o0358dlqp1853eafackm2edren909e1m.apps.googleusercontent.com"
  };
}
export default key;