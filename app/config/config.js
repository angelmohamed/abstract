var key = {};
 if (process.env.NODE_ENV == "production") {
  key = {
    frontUrl: "https://sonotrade-frontend-2025.pages.dev",
    baseUrl: "https://sonotradesdemo.wearedev.team/api/v1/user",
    backendURL: "https://sonotradesdemo.wearedev.team",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy-bor-rpc.publicnode.com",
    getLoginInfo: "https://freeipapi.com/api/json",
    chainId: 80002,
    chaincode: "amoy",
    txurl: "https://testnet.bscscan.com",
    usdcAdd : "0xeC35E5e8c4B26510F5FA90b00F202E1B44B8F537",
    contractAdd : "0x07b67af96d444ea2842Faca9Ff2B68a358f83B82",
    clientId: "787150198264-2mkh4meu0m9phtb4m65f7bdre82kuibl.apps.googleusercontent.com"
  }
} else {
  key = {
    frontUrl: "http://localhost:3000",
    baseUrl: "http://localhost:3001/api/v1/user",
    backendURL: "http://localhost:3001",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy-bor-rpc.publicnode.com",
    getLoginInfo: "https://freeipapi.com/api/json",
    chainId: 80002,
    chaincode: "amoy",
    txurl: "https://testnet.bscscan.com",
    usdcAdd : "0xeC35E5e8c4B26510F5FA90b00F202E1B44B8F537",
    contractAdd : "0x07b67af96d444ea2842Faca9Ff2B68a358f83B82",
    clientId: "787150198264-2qt0ai7tjcu85ehjfh81kum2nsh8momt.apps.googleusercontent.com"
  };
}
export default key;