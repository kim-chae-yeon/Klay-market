import logo from './logo.svg';
import Caver from 'caver-js';
// KAS Authorization key는 환경변수 처리
import * as env_var from './variables';
import './App.css';

// 1 Smart contract 배포 주소 파악(가져오기)
const COUNT_CONTRACT_ADDRESS = '0x528E1B675fd0aDd555e27e39BEA24C6AB643E1d5';

// 2 caver.js 이용해서 스마트 컨트랙트 연동하기
// KAS에서 요구하는 option
const CHAIN_ID = '1001'; // MAINNET: 8217, TESTNET: 1001;

const option = {
  headers: [
    {
      name: "Authorization",
      value: env_var.KAS_AUTH
    },
    {name: "x-chain-id", value: CHAIN_ID}
  ]
}

// klaytn api 연결
const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option));
// ABI => Klaytn IDE COMPILER 밑에 ABI COPY 후 remove line break
const COUNT_ABI = '[ { "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "count", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getBlockNumber", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]';
// ABI와 주소를 이용하여 Count 컨트랙트 연결
const CountContract = new caver.contract(JSON.parse(COUNT_ABI), COUNT_CONTRACT_ADDRESS);


// 3 가져온 스마트 컨트랙트 실행 결과(데이터) 웹에 표현하기
const readCount = async () => {
  // Count컨트랙트의 count 함수 호출
  const _count = await CountContract.methods.count().call();
  console.log(_count);
}

const getBalance = (address) => {
  // caver.rpc.klay.getBalance(): address에 있는 클레이 가져와주는 함수
  return caver.rpc.klay.getBalance(address).then((response) => {
    // caver.utils.convertFromPeb: 펩 단위에서 클레이 단위로
    const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
    console.log(`BALANCE: ${balance}`)
    return balance;
  })
}

const setCount = async (newCount) => {
  try {
    // 1. 사용할 account (개인 계좌) 설정
    const deployer = caver.wallet.keyring.createFromPrivateKey(env_var.ACCOUNT_PRIVATE_KEY);
    caver.wallet.add(deployer);

    // 2. 스마트 컨트랙트 실행 트랙잭션 날리기 
    // call 대신 send
    const receipt = await CountContract.methods.setCount(newCount).send({
      from: deployer.address, // address
      gas: "0x4bfd200" // 수수료 (임의의 숫자)
    });
  
    // 3. 결과 확인
    console.log(receipt);
  } catch(e) {
    console.log(`[ERROR_SET_COUNT]${e}`);
  }
}

function App() {
  readCount();
  getBalance('0xb4f8ba912aeeefa7f155bac55e31b485dc2ee713');
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button title={'count 변경'} onClick={()=>{setCount(100)}} />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;