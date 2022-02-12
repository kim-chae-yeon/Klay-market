import React, { useState } from "react";
import QRCode from 'qrcode.react';
import { fetchCardsOf, getBalance, readCount, setCount } from './api/UseCaver';
import * as KlipAPI from "./api/UseKlip";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import './market.css';
import { Alert, Container, Card, Nav, Form, Button } from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from "./constants";

const DEFAULT_QR_CODE = 'DEFAULT';
const DEFAULT_ADDRESS = "0x000000000000000000000000"
function App() {
  // State Data

  // Global Data
  // 1. address
  const [myAddress, setMyAddress] = useState(DEFAULT_ADDRESS);
  // 2. 잔고
  const [myBalance, setMyBalance] = useState("0");
  // 3. NFT
  const [nfts, setNfts] = useState([]); // [ {tokenId: 100, tokenUri: "https://ddd.png" } ]


  // UI
  const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);
  // 1. Tab 메뉴
  const [tab, setTab] = useState('MINT'); // MARKET, MINT, WALLET
  // 2. mintInput
  const [mintImageUrl, setMintImageUrl] = useState("");
  // 3. Modal


  // function
  // 1. fetchMarketNFTs
  const fetchMarketNFTs = async () => {
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  }
  // 2. fetchMyNFTs
  const fetchMyNFTs = async () => {
    const _nfts = await fetchCardsOf(myAddress);
    setNfts(_nfts);
  }
  // 3. OnClickMint
  const onClickMint = async (uri) => {
    if (myAddress === DEFAULT_ADDRESS) alert('NO ADDRESS');
    const randomTokenId = parseInt(Math.random() * 100000000);
    KlipAPI.mintCardWithURI(myAddress, randomTokenId, uri, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }
  // 4. onClickMyCard
  // 5. onClickMarketCard

  // 6. getUserData
  const getUserData = () => {
    KlipAPI.getAddress(setQrvalue, async (address) => {
      setMyAddress(address);
      const _balance = await getBalance(address);
      setMyBalance(_balance);
    });
  };

  return (
    <div className="App">
      {/* top: 주소 잔고 */}
      <div style={{ backgroundColor: "black", padding: 10 }}>
        <div style={{ fontSize: 30, fontWeight: "bold", paddingLeft: 5, marginTop: 10 }}>내 지갑</div>
        {myAddress}
        <br />
        <Alert onClick={getUserData} variant={"balance"} style={{ backgroundColor: "#f40075", fontSize: 25 }}>{myBalance} KLAY</Alert>

        {/* QR 코드 */}
        <Container style={{ backgroundColor: "white", width: 300, height: 300, padding: 20 }}>
        <QRCode value={qrvalue} size={256} style={{ margin: "auto" }} />
        </Container>
        <br/>

        {/* middle: 갤러리 (마켓, 내 지갑) */}
        {tab === 'MARKET' || tab === 'WALLET' ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {nfts.map((nft, index) => (
              <Card.Img className="img-responsive" src={nfts[index].uri} />
            ))}
          </div>
        ) : null}

        {/* middle: 발행 페이지 */}
        {tab === 'MINT' ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            <Card className="text-center"
              style={{ color: "black", height: "50%", borderColor: "#C5B358" }}>
              <Card.Body style={{ opacity: 0.9, backgroundColor: "black" }}>
                {mintImageUrl !== "" ? <Card.Img src={mintImageUrl} height={"50%"} /> : null}
                <Form>
                  <Form.Group>
                    {/* 이미지 주소 입력란 */}
                    <Form.Control
                      value={mintImageUrl}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintImageUrl(e.target.value);
                      }}
                      type="text"
                      placeholder="이미지 주소를 입력해주세요"
                    />
                  </Form.Group>
                  <br />
                  <Button
                    onClick={() => { onClickMint(mintImageUrl); }}
                    variant="primary" style={{ backgroundColor: "#810034", borderColor: "#810034" }}>발행하기</Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        ) : null}

      </div>

      <button onClick={fetchMyNFTs}>
        NFT 가져오기
      </button>


      {/* bottom: 탭 메뉴 */}
      <nav style={{ backgroundColor: "#1b1717", height: 45 }} className="navbar fixed-bottom navbar-light" role="navigation">
        <Nav className="w-100">
          <div className="d-flex flex-row justify-content-around w-100">
            <div onClick={() => {
              setTab("MARKET");
              fetchMarketNFTs();
            }} className="row d-flex flex-column justify-content-center align-items-center">
              <div>MARKET</div>
            </div>

            <div onClick={() => {
              setTab("MINT");
            }} className="row d-flex flex-column justify-content-center align-items-center">
              <div>MINT</div>
            </div>

            <div onClick={() => {
              setTab("WALLET");
              fetchMyNFTs();
            }} className="row d-flex flex-column justify-content-center align-items-center">
              <div>WALLET</div>
            </div>

          </div>
        </Nav>
      </nav>
    </div>
  );
}

export default App;