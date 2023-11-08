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
  const [isConnected, setIsConnected] = useState(false); // Track MetaMask connection
  const [tokenURI, setTokenURI] = useState(""); // Token URI

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contractInstance = new web3Instance.eth.Contract(abi, "0x928297De339eb353b6150f69c23aaE61639dD4EA"); // Replace with your contract address
      setContract(contractInstance);

      // Check if MetaMask is already connected
      if (window.ethereum.selectedAddress) {
        setAccounts([window.ethereum.selectedAddress]);
        setIsConnected(true);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  }, []);

  // Function to connect to MetaMask
  const connectToMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable(); // Request account access
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    }
  };

  // Mint token function with user's address as parameter
  const mintToken = async () => {
    console.log(accounts[0])
    console.log(tokenURI)
    if (contract && accounts.length > 0) {
      const toAddress = accounts[0]; // Use the user's address as the recipient address
      try {
        // Replace 'safeMint' with your contract's mint method and pass the parameters
        await contract.methods.safeMint(toAddress, tokenURI).send({ from: accounts[0] });
        console.log("Minting successful");
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
          // If connected, display the Mint Token form
          <div>
            <label htmlFor="tokenURI">Token URI:</label>
            <input
              type="text"
              id="tokenURI"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
            />
            <br />
            <button onClick={mintToken} className="btn btn-primary">
              Mint Token
            </button>
          </div>
        ) : (
          // If not connected, display the Connect to MetaMask button
          <button onClick={connectToMetaMask} className="btn btn-primary">
            Connect to MetaMask
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;
