import Caver from 'caver-js';
import { KAS_AUTH, ACCOUNT_PRIVATE_KEY, CHAIN_ID, COUNT_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS } from '../constants'
// import CounterABI from '../abi/CounterABI.json'
import KIP17ABI from '../abi/KIP17TokenABI.json';

const option = {
  headers: [
    {
      name: "Authorization",
      value: KAS_AUTH
    },
    {name: "x-chain-id", value: CHAIN_ID}
  ]
}

// klaytn api 연결
const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option));
// ABI와 주소를 이용하여 컨트랙트 연결
const NFTContract = new caver.contract(KIP17ABI, NFT_CONTRACT_ADDRESS)

// NFT 조회
export const fetchCardsOf = async (address) => {
  // fetch Balance (balanceOf)
  const balance = await NFTContract.methods.balanceOf(address).call();
  console.log(`[NFT Balance] ${balance}`);

  // fetch Token IDs (tokenOfOwnerByIndex)
  const tokenIds = [];
  for (let i=0; i<balance; i++) {
    const id = await NFTContract.methods.tokenOfOwnerByIndex(address, i).call();
    tokenIds.push(id);
  }
  
  // fetch Token URIs (tokenURI)
  const tokenUris = [];
  for (let i=0; i<balance; i++) {
    const uri = await NFTContract.methods.tokenURI(tokenIds[i]).call();
    tokenUris.push(uri);
  }

  const nfts = [];
  for (let i=0; i<balance; i++){
    nfts.push({uri: tokenUris[i], id: tokenIds[i]});
  }

  console.log(nfts);
  return nfts;
}


export const getBalance = (address) => {
  // caver.rpc.klay.getBalance(): address에 있는 클레이 가져와주는 함수
  return caver.rpc.klay.getBalance(address).then((response) => {
    // caver.utils.convertFromPeb: 펩 단위에서 클레이 단위로
    const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
    console.log(`BALANCE: ${balance}`)
    return balance;
  })
}

// const CountContract = new caver.contract(CounterABI, COUNT_CONTRACT_ADDRESS);

// export const readCount = async () => {
//   // Count컨트랙트의 count 함수 호출
//   const _count = await CountContract.methods.count().call();
//   console.log(_count);
// }

// export const setCount = async (newCount) => {
//   try {
//     // 1. 사용할 account (개인 계좌) 설정
//     const deployer = caver.wallet.keyring.createFromPrivateKey(ACCOUNT_PRIVATE_KEY);
//     caver.wallet.add(deployer);

//     // 2. 스마트 컨트랙트 실행 트랙잭션 날리기 
//     // call 대신 send
//     const receipt = await CountContract.methods.setCount(newCount).send({
//       from: deployer.address, // address
//       gas: "0x4bfd200" // 수수료 (임의의 숫자)
//     });
  
//     // 3. 결과 확인
//     console.log(receipt);
//   } catch(e) {
//     console.log(`[ERROR_SET_COUNT]${e}`);
//   }
// }
