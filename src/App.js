import React, { useEffect, useState } from "react";
import QRCode from 'qrcode.react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faHome, faWallet, faPlus } from "@fortawesome/free-solid-svg-icons";
import { fetchCardsOf, getBalance } from './api/UseCaver';
import * as KlipAPI from "./api/UseKlip";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import './market.css';
import { Alert, Container, Card, Nav, Form, Button, Modal, Row, Col } from "react-bootstrap";
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
  const [nfts, setNfts] = useState([]); // [ {id: 100, uri: "https://ddd.png" } ]


  // UI
  const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);
  // 1. Tab 메뉴
  const [tab, setTab] = useState('MARKET'); // MARKET, MINT, WALLET
  // 2. mintInput
  const [mintImageUrl, setMintImageUrl] = useState("");
  // 3. Modal
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "MODAL",
    onConfirm: () => { }
  });

  // NFT 갤러리 행
  const rows = nfts.slice(nfts.length / 2);

  // function
  // 1. fetchMarketNFTs
  const fetchMarketNFTs = async () => {
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  }
  // 2. fetchMyNFTs
  const fetchMyNFTs = async () => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert('NO ADDRESS');
      return;
    }
    const _nfts = await fetchCardsOf(myAddress);
    setNfts(_nfts);
  }
  // 3. OnClickMint
  const onClickMint = async (uri) => {
    if (myAddress === DEFAULT_ADDRESS) {
      alert('NO ADDRESS');
      return;
    }
    const randomTokenId = parseInt(Math.random() * 100000000);
    KlipAPI.mintCardWithURI(myAddress, randomTokenId, uri, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }
  // 4. onClickMyCard
  const onClickMyCard = (tokenId) => {
    KlipAPI.listingCard(myAddress, tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }
  // 5. onClickMarketCard
  const onClickMarketCard = (tokenId) => {
    KlipAPI.buyCard(tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  }

  const onClickCard = (id) => {

    if (tab === 'WALLET') {
      // 판매 하시겠습니까 모달
      setModalProps({
        title: "NFT를 마켓에 올리시겠어요?",
        onConfirm: () => {
          onClickMyCard(id);
        }
      })
    }
    if (tab === 'MARKET') {
      // 구매 하시겠습니까 모달
      setModalProps({
        title: "NFT를 구매하시겠어요?",
        onConfirm: () => {
          onClickMarketCard(id);
        }
      })
    }
    setShowModal(true);
  }

  // 6. getUserData
  const getUserData = () => {
    // 지갑을 연동하시겠습니까 모달
    setModalProps({
      title: "Klip 지갑을 연동하시겠습니까?",
      onConfirm: () => {
        KlipAPI.getAddress(setQrvalue, async (address) => {
          setMyAddress(address);
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });
      }
    })
    setShowModal(true);
  };


  // 처음 실행했을 때 나오는 화면 -> useEffect
  useEffect(() => {
    getUserData();
    fetchMarketNFTs();
  }, [])

  return (
    <div className="App">
      {/* top: 주소 잔고 */}
      <div style={{ backgroundColor: "black", padding: 10 }}>
        <div style={{ fontSize: 30, fontWeight: "bold", paddingLeft: 5, marginTop: 10 }}>내 지갑</div>
        {myAddress}
        <br />
        <Alert onClick={getUserData} variant={"balance"} style={{ backgroundColor: "#f40075", fontSize: 25 }}>
          {myAddress !== DEFAULT_ADDRESS ? `${myBalance} KLAY`: "지갑 연동하기"}
        </Alert>

        {/* DEFAULT 아닌 경우에만 QR 코드 */}

        {qrvalue !== 'DEFAULT' ? (
          <Container style={{ backgroundColor: "white", width: 300, height: 300, padding: 20 }}>
            <QRCode value={qrvalue} size={256} style={{ margin: "auto" }} />
          </Container>) : null}

        <br />

        {/* middle: 갤러리 (마켓, 내 지갑) */}
        {tab === 'MARKET' || tab === 'WALLET' ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {rows.map((o, rowIndex) => (
              <Row key={`rowkey${rowIndex}`}>
                <Col style={{marginRight: 0, paddingRight: 0}}>
                  <Card onClick={() => {
                    onClickCard(nfts[rowIndex*2].id);
                  }}>
                    <Card.Img src={nfts[rowIndex*2].uri} />
                  </Card>
                  [{nfts[rowIndex*2].id}] NFT
                </Col>
                <Col style={{marginRight: 0, paddingRight: 0}}>
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <Card onClick={() => {
                      onClickCard(nfts[rowIndex*2].id);
                    }}>
                      <Card.Img src={nfts[rowIndex*2].uri} />
                    </Card>
                  ): null}

                  {nfts.length > rowIndex * 2 + 1 ? (
                    <>[{nfts[rowIndex*2].id}] NFT</>
                  ): null}
                  
                </Col>
              </Row>
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

      {/* 모달 */}
      <Modal
        centered
        size="sm"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
      >
        <Modal.Header
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        >
          <Modal.Title>
            {modalProps.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}>
          <Button variant="secondary" onClick={() => { setShowModal(false); }}>닫기</Button>
          <Button variant="primary" onClick={() => {
            modalProps.onConfirm();
            setShowModal(false);
          }}
            style={{ backgroundColor: "#810034", borderColor: "#810034" }}
          >진행</Button>
        </Modal.Footer>
      </Modal>

      {/* bottom: 탭 메뉴 */}
      <nav style={{ backgroundColor: "#1b1717", height: 45 }} className="navbar fixed-bottom navbar-light" role="navigation">
        <Nav className="w-100">
          <div className="d-flex flex-row justify-content-around w-100">
            <div onClick={() => {
              setTab("MARKET");
              fetchMarketNFTs();
            }} className="row d-flex flex-column justify-content-center align-items-center">
              <div><FontAwesomeIcon color="white" size="lg" icon={faHome}/></div>
            </div>

            <div onClick={() => {
              setTab("MINT");
            }} className="row d-flex flex-column justify-content-center align-items-center">
              <div><FontAwesomeIcon color="white" size="lg" icon={faPlus}/></div>
            </div>

            <div onClick={() => {
              setTab("WALLET");
              fetchMyNFTs();
            }} className="row d-flex flex-column justify-content-center align-items-center">
              <div><FontAwesomeIcon color="white" size="lg" icon={faWallet}/></div>
            </div>

          </div>
        </Nav>
      </nav>
    </div>
  );
}

export default App;