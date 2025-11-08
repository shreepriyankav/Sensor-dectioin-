const fs = require('fs');

class BlockchainService {
  constructor() {
    this.enabled = false;
    try {
      const { Web3 } = require('web3');
      this.web3 = new Web3('http://localhost:8545');
      this.account = process.env.ACCOUNT_ADDRESS || '0xYourAccountAddress';
      this.privateKey = process.env.PRIVATE_KEY || '0xYourPrivateKey';
      this.contractAddress = process.env.CONTRACT_ADDRESS || '0xYourContractAddress';
      
      if (fs.existsSync('./contracts/BeaconRegistry.json')) {
        const contractABI = JSON.parse(fs.readFileSync('./contracts/BeaconRegistry.json', 'utf8'));
        this.contract = new this.web3.eth.Contract(contractABI.abi, this.contractAddress);
        this.enabled = true;
        console.log('Blockchain service enabled');
      } else {
        console.log('Contract ABI not found - blockchain disabled');
      }
    } catch (error) {
      console.log('Blockchain initialization failed - running without blockchain');
    }
  }
  
  async recordIncident(beaconId, latitude, longitude) {
    if (!this.enabled) {
      console.log('Blockchain disabled - incident logged locally only');
      return 'blockchain_disabled_' + Date.now();
    }
    
    try {
      const tx = {
        from: this.account,
        to: this.contractAddress,
        gas: 200000,
        data: this.contract.methods.recordIncident(beaconId, latitude, longitude).encodeABI()
      };
      
      const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      console.log('Incident recorded on blockchain:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Blockchain error:', error);
      return 'blockchain_error_' + Date.now();
    }
  }
  
  async getIncident(incidentId) {
    if (!this.enabled) {
      return { error: 'Blockchain disabled' };
    }
    return await this.contract.methods.incidents(incidentId).call();
  }
}

module.exports = BlockchainService;