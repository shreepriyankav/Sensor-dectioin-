const Web3 = require('web3');
const fs = require('fs');

async function deployContract() {
  const web3 = new Web3('http://localhost:8545');
  
  // Get accounts
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];
  
  // Read contract
  const contractSource = fs.readFileSync('./contracts/BeaconRegistry.sol', 'utf8');
  const solc = require('solc');
  
  const input = {
    language: 'Solidity',
    sources: {
      'BeaconRegistry.sol': { content: contractSource }
    },
    settings: {
      outputSelection: {
        '*': { '*': ['*'] }
      }
    }
  };
  
  const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = compiled.contracts['BeaconRegistry.sol']['BeaconRegistry'];
  
  // Deploy
  const deployContract = new web3.eth.Contract(contract.abi);
  const deployTx = deployContract.deploy({ data: contract.evm.bytecode.object });
  
  const deployedContract = await deployTx.send({
    from: deployer,
    gas: 2000000,
    gasPrice: '20000000000'
  });
  
  console.log('Contract deployed at:', deployedContract.options.address);
  
  // Save ABI and address
  fs.writeFileSync('./contracts/BeaconRegistry.json', JSON.stringify({
    abi: contract.abi,
    address: deployedContract.options.address
  }, null, 2));
  
  return deployedContract.options.address;
}

deployContract().catch(console.error);