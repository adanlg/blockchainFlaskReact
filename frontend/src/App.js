import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Web3 from "web3";
import { abi } from "./abi1"; // Update this path

import { Navbar } from "./components/Navbar";
import { About } from "./components/About";
import { Users } from "./components/Users";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contractInstance = new web3Instance.eth.Contract(abi, "0x928297De339eb353b6150f69c23aaE61639dD4EA");
      setContract(contractInstance);

      if (window.ethereum.selectedAddress) {
        setAccounts([window.ethereum.selectedAddress]);
        setIsConnected(true);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  }, []);

  const connectToMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    }
  };

  const handleFileInput = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToPinata = async (file) => {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    let data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "pinata_api_key": "3443762cab256e15b3de",
          "pinata_secret_api_key": "075e69533693e9a34e5c2091161a544aa1bfb41d917b6d597fe3ea4d281f5b41"
        },
        body: data
      });

      const pinataResponse = await response.json();
      return pinataResponse.IpfsHash;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      return null;
    }
  };

  const mintToken = async () => {
    if (contract && accounts.length > 0 && file) {
      const toAddress = accounts[0];
      try {
        const cid = await uploadToPinata(file);
        if (cid) {
          console.log(cid)
          console.log(toAddress)
          const tokenURI = `ipfs://${cid}`;
          await contract.methods.safeMint(toAddress, tokenURI).send({ from: accounts[0] });
          console.log("Minting successful with tokenURI:", tokenURI);
        } else {
          console.error("Failed to upload file to Pinata");
        }
      } catch (error) {
        console.error("Error minting token:", error);
      }
    }
  };

  return (
    <Router>
      <Navbar />

      <div className="container p-4">
        <Switch>
          <Route path="/about" component={About} />
          <Route path="/" component={Users} />
        </Switch>

        {isConnected ? (
          <div>
            <label htmlFor="fileInput">Token File:</label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileInput}
            />
            <br />
            <button onClick={mintToken} className="btn btn-primary">
              Mint Token
            </button>
          </div>
        ) : (
          <button onClick={connectToMetaMask} className="btn btn-primary">
            Connect to MetaMask
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;
