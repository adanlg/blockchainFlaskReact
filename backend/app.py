from flask import Flask, jsonify, request
from flask_pymongo import PyMongo, ObjectId
from flask_cors import CORS
import json
from web3 import Web3, HTTPProvider

with open('/home/adanlg2/myprojectflask2/flaskMongoReact/flask-react-mongodb-crud/backend/abi.json', 'r') as abi_definition:
    contract_abi = json.load(abi_definition)

# Instantiation
app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://localhost/juan'
mongo = PyMongo(app)

# Settings
CORS(app)

# Database
collection = mongo.db.luis  # Use 'collection' directly for MongoDB operations

web3 = Web3(HTTPProvider('https://sepolia.infura.io/v3/2baf96dbc430498f93cc9ab228eb3de1'))

# Set up the contract
contract_address = web3.to_checksum_address('0x928297De339eb353b6150f69c23aaE61639dD4EA')
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Your Ethereum account private key
private_key = 'YOUR_PRIVATE_KEY'

# Routes
@app.route('/mint', methods=['POST'])
def mint_nft():
    # Assuming the request has the 'to' address and 'uri' for the NFT
    to_address = request.json['to']
    token_uri = request.json['uri']

    # The account that is sending the transaction
    account = web3.eth.account.privateKeyToAccount(private_key)

    # Build the transaction
    nonce = web3.eth.getTransactionCount(account.address)
    tx = contract.functions.safeMint(to_address, token_uri).buildTransaction({
        'chainId': 11155111,  # Sepolia Testnet Chain ID
        'gas': 2000000,
        'gasPrice': web3.toWei('50', 'gwei'),
        'nonce': nonce
    })

    # Sign the transaction
    signed_tx = account.sign_transaction(tx)

    # Send the transaction
    tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)

    # Wait for the transaction to be mined
    receipt = web3.eth.waitForTransactionReceipt(tx_hash)

    return jsonify({'transaction_hash': str(tx_hash.hex()), 'receipt': dict(receipt)})


# Routes
@app.route('/users', methods=['POST'])
def createUser():

    print(request.json)
    data = {
        'name': request.json['name'],
        'email': request.json['email'],
        'password': request.json['password']
    }

    result = collection.insert_one(data)
    inserted_id = result.inserted_id

    return jsonify(str(inserted_id))

@app.route('/users', methods=['GET'])
def getUsers():
    users = []
    for doc in collection.find({}):
        users.append({
            '_id': str(doc['_id']),
            'name': doc['name'],
            'email': doc['email'],
            'password': doc['password']
        })
    return jsonify(users)

@app.route('/users/<id>', methods=['GET'])
def getUser(id):
    user = collection.find_one({'_id': ObjectId(id)})
    return jsonify({
        '_id': str(ObjectId(user['_id'])),
        'name': user['name'],
        'email': user['email'],
        'password': user['password']
    })

@app.route('/users/<id>', methods=['DELETE'])
def deleteUser(id):
    collection.delete_one({'_id': ObjectId(id)})
    return jsonify({'message': 'User Deleted'})

@app.route('/users/<id>', methods=['PUT'])
def updateUser(id):
    print(request.json)
    collection.update_one({'_id': ObjectId(id)}, {"$set": {
        'name': request.json['name'],
        'email': request.json['email'],
        'password': request.json['password']
    }})
    return jsonify({'message': 'User Updated'})

if __name__ == "__main__":
    app.run(debug=True)
