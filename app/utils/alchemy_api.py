from web3 import Web3
import requests
import os

def get_usdc_transactions(alchemy_api_key, usdc_contract_address='0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'):
    # Connect to Sepolia via Alchemy
    """
    Fetches recent transactions involving the USDC contract on Sepolia.

    Parameters
    ----------
    alchemy_api_key : str
        Alchemy API key
    usdc_contract_address : str, optional
        The contract address of USDC on Sepolia, by default '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

    Returns
    -------
    list
        A list of recent transactions involving the USDC contract on Sepolia, with the following keys:
        - `hash`: the transaction hash
        - `amount`: the amount of the transaction (placeholder, should be replaced with actual amount)
        - `sender`: the sender of the transaction
        - `receiver`: the receiver of the transaction
        - `timestamp`: the timestamp of the transaction
    """
    w3 = Web3(Web3.HTTPProvider(f'https://eth-sepolia.g.alchemy.com/v2/{alchemy_api_key}'))
    if not w3.is_connected():
        raise Exception("Failed to connect to Sepolia")
    
    # Fetch recent blocks (example: last 100 blocks)
    latest_block = w3.eth.get_block('latest')
    transactions = []
    for block_number in range(latest_block.number - 100, latest_block.number + 1):
        block = w3.eth.get_block(block_number, full_transactions=True)
        for tx in block.transactions:
            if tx.get('to') == usdc_contract_address:
                transactions.append({
                    'hash': tx['hash'].hex(),
                    'amount': w3.eth.get_transaction_receipt(tx['hash']).gasUsed,  # Placeholder for amount
                    'sender': tx['from'],
                    'receiver': tx['to'],
                    'timestamp': block.timestamp
                })
    return transactions