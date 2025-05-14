import unittest
from app.utils.alchemy_api import get_usdc_transactions

class TestAlchemyAPI(unittest.TestCase):
    def test_get_usdc_transactions(self):
        """
        Tests that the get_usdc_transactions function returns a list of transactions.

        Note: requires a valid Alchemy API key or a mock of the Alchemy API.
        """
        api_key = 'invalid-key'  # Use a test key or mock
        try:
            transactions = get_usdc_transactions(api_key)
            self.assertIsInstance(transactions, list)
        except Exception:
            self.fail("Alchemy API connection failed unexpectedly")

if __name__ == '__main__':
    unittest.main()