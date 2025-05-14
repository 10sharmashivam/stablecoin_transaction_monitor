import boto3
import json
import os

def store_transactions_to_s3(transactions, bucket_name):
    """
    Stores a list of transactions in an S3 bucket as a JSON file.

    Parameters
    ----------
    transactions : list
        A list of transaction dictionaries. Each dictionary should include a 'timestamp' key.
    bucket_name : str
        The name of the S3 bucket where the transactions will be stored.

    Returns
    -------
    str
        The key of the stored JSON file in the S3 bucket.
    """

    s3 = boto3.client('s3')
    timestamp = transactions[0]['timestamp'] if transactions else 'default'
    key = f'transactions/{timestamp}.json'
    s3.put_object(
        Bucket=bucket_name,
        Key=key,
        Body=json.dumps(transactions)
    )
    return key